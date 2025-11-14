import { useState, useEffect, useCallback, useMemo } from 'react';
import { apiFetch } from '../../utils/apiFetch';

// Definición de las acciones que requieren confirmación
const ACTION_RESET = 'reset';
const ACTION_DELETE = 'delete';
const ACTION_BLOCK = 'block';

const BLOCK_DURATIONS = [
    { value: '2', label: '2 días' }, 
    { value: '5', label: '5 días' }, 
    { value: '30', label: '1 mes (30 días)' },
    { value: 'indefinido', label: 'Bloqueo Indefinido' } 
];

const PERMISO_VER_VISTA = 'ver_usuarios';
const PERMISO_BLOQUEAR = 'bloquear_usuario';
const PERMISO_ELIMINAR = 'eliminar_usuario';
const PERMISO_RESET = 'resetear_pass';

/**
 * Hook personalizado para manejar la lógica de la gestión de Usuarios.
 * @param {object} authContext - Contiene las funciones de useAuth (tienePermiso, isLoading).
 * @returns {object} Todos los estados y handlers necesarios para la UI.
 */
const useUsuarios = ({ tienePermiso, isLoading }) => {
    // --- 1. Estados de Datos y Control ---
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtroTipo, setFiltroTipo] = useState('');
    const [mensaje, setMensaje] = useState(''); // Estado para mensajes de éxito/error

    // ESTADOS PARA EL MODAL DE CONFIRMACIÓN
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [currentAction, setCurrentAction] = useState(null); 
    const [targetUsuario, setTargetUsuario] = useState(null); // A qué usuario afecta

    // --- 2. Permisos ---
    const puedeVer = tienePermiso(PERMISO_VER_VISTA);
    const puedeBloquear = tienePermiso(PERMISO_BLOQUEAR);
    const puedeEliminar = tienePermiso(PERMISO_ELIMINAR);
    const puedeResetear = tienePermiso(PERMISO_RESET);

    // --- 3. Utilidades ---
    const extractErrorMessage = useCallback((error, defaultMessage) => {
        const errorBody = error.response || {};
        const errorMessage = errorBody.error || defaultMessage;
        return errorMessage + (errorBody.details ? ` (${errorBody.details})` : '');
    }, []);
    
    // Función de carga principal
    const fetchUsuarios = useCallback(async () => {
        if (!puedeVer) {
            setMensaje('No tiene permiso para ver la lista de usuarios.');
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const response = await apiFetch('/api/personas'); 
            setUsuarios(response); 
            // IMPORTANTE: Se elimina setMensaje('') para no borrar mensajes de éxito
            // generados por las acciones de mutación (reset, bloqueo, etc.).
        } catch (error) {
            // Si el fetch falla, SÍ debemos mostrar el error.
            const fullMessage = extractErrorMessage(error, 'Error al cargar la lista de usuarios.');
            console.error('Error al cargar usuarios:', error);
            setMensaje(fullMessage);
            setUsuarios([]);
        } finally {
            setLoading(false);
        }
    }, [puedeVer, extractErrorMessage]);

    // Función para que el componente padre pueda borrar el mensaje (ej: al cambiar de filtro)
    const clearMessage = useCallback(() => {
        setMensaje('');
    }, []);

    // --- 4. Efecto de Carga Inicial ---
    useEffect(() => {
        if (!isLoading) {
            setMensaje(''); // Limpiar cualquier mensaje al inicio de la carga
            fetchUsuarios();
        }
    }, [isLoading, fetchUsuarios]);

    // --- 5. Handlers de Modales ---
    const openConfirmModal = useCallback((action, usuario) => {
        setMensaje(''); // Limpiamos el mensaje al iniciar una nueva acción
        setCurrentAction(action);
        setTargetUsuario(usuario);
        setShowConfirmModal(true);
    }, []);

    const closeConfirmModal = useCallback(() => {
        setShowConfirmModal(false);
        setCurrentAction(null);
        setTargetUsuario(null);
    }, []);

    // --- 6. Handlers de Acciones (Lógica de API) ---
    const resetearContraseña = useCallback(async (id) => {
        if (!puedeResetear) { 
             setMensaje('Acción denegada: No tiene permiso para resetear contraseñas.');
             return;
        }
        try {
            const response = await apiFetch(`/api/personas/${id}/reset-password`, {
                method: 'PUT',
                body: {}
            });
            
            // 1. Establecemos el mensaje de éxito (con la nueva contraseña)
            setMensaje(`Reseteo de contraseña exitoso: Nueva contraseña para ID ${id}: ${response.nuevaPassword}`);
            
            // 2. Recargamos los usuarios sin borrar el mensaje
            fetchUsuarios(); 
            
        } catch (error) {
            const fullMessage = extractErrorMessage(error, 'Error al resetear la contraseña.');
            console.error('Error al resetear contraseña:', error);
            setMensaje(fullMessage);
        }
    }, [puedeResetear, fetchUsuarios, extractErrorMessage]);

    const eliminarCuenta = useCallback(async (usuarioId) => {
        if (!puedeEliminar) { 
             setMensaje('Acción denegada: No tiene permiso para eliminar usuarios.');
             return;
        }
        try {
            await apiFetch(`/api/personas/${usuarioId}/eliminar`, {
                method: 'PUT',
                body: {
                    motivo: "Eliminación lógica por administrador"
                }
            });
            
            setMensaje(`Baja Lógica: La cuenta con ID ${usuarioId} fue marcada como eliminada.`);
            fetchUsuarios(); 
            
        } catch (error) {
            const fullMessage = extractErrorMessage(error, 'Error al eliminar la cuenta.');
            console.error('Error al eliminar la cuenta:', error);
            setMensaje(fullMessage);
        }
    }, [puedeEliminar, fetchUsuarios, extractErrorMessage]);

    const toggleBloqueo = useCallback(async (usuario, motivo = null, duracionBloqueoDias = null) => {
        
        if (!puedeBloquear) { 
              // El mensaje ahora debe ser más genérico, ya que cubre ambas acciones.
              setMensaje('Acción denegada: No tiene permiso para bloquear o desbloquear usuarios.');
              return;
        }
        
        const nuevoEstado = usuario.estado_cuenta === 'Activo' ? 'Bloqueado' : 'Activo';
        const accion = nuevoEstado === 'Bloqueado' ? 'bloquear' : 'desbloquear/reactivar';
    
        try {
            const body = { 
                nuevoEstado: nuevoEstado,
                motivo: motivo || "" 
            };
    
            if (nuevoEstado === 'Bloqueado' && duracionBloqueoDias) {
                // Enviar la duración (número o 'indefinido')
                body.duracionBloqueoDias = duracionBloqueoDias; 
            }
    
            await apiFetch(`/api/personas/${usuario.id}/estado`, {
                method: 'PUT',
                body: body
            });
    
            let mensajeExito;
            if (usuario.estado_cuenta === 'Eliminado') {
                mensajeExito = `La cuenta de ${usuario.nombre} fue reactivada exitosamente.`;
            } else {
                mensajeExito = `Éxito: La cuenta de ${usuario.nombre} fue ${accion === 'bloquear' ? 'bloqueada' : 'desbloqueada'} exitosamente.`;
                if (accion === 'bloquear' && duracionBloqueoDias) {
                    mensajeExito += duracionBloqueoDias === 'indefinido' ? ' (Indefinido).' : ` (Por ${duracionBloqueoDias} días).`;
                }
            }
            setMensaje(mensajeExito);
            fetchUsuarios(); 
                
        } catch (error) {
            const fullMessage = extractErrorMessage(error, `Error al ${accion} la cuenta.`);
            console.error('Error al cambiar el estado de la cuenta:', error);
            setMensaje(fullMessage);
        }
    }, [puedeBloquear, fetchUsuarios, extractErrorMessage]);

    // Función que se ejecuta al confirmar cualquier modal
    const handleConfirmAction = useCallback(async (motivo = null, duracion = null) => { 
        closeConfirmModal(); 

        if (!targetUsuario) return;
      
        switch (currentAction) {
            case ACTION_RESET:
                await resetearContraseña(targetUsuario.id);
                break;
            case ACTION_DELETE:
                await eliminarCuenta(targetUsuario.id); 
                break;
            case ACTION_BLOCK:
                await toggleBloqueo(targetUsuario, motivo, duracion);
                break;
            default:
                break;
        }
    }, [closeConfirmModal, targetUsuario, currentAction, resetearContraseña, eliminarCuenta, toggleBloqueo]);

    // --- 7. Lógica de Filtrado (useMemo) ---
    const usuariosFiltrados = useMemo(() => {
        if (!filtroTipo) return usuarios;
        // Asumimos que el campo 'tipo' en el objeto usuario es lo que se usa para filtrar
        return usuarios.filter(u => u.tipo === filtroTipo);
    }, [usuarios, filtroTipo]);

    // --- 8. Propiedades del Modal (useMemo) ---
    const modalProps = useMemo(() => {
        if (!targetUsuario) return {};

        switch (currentAction) {
            case ACTION_RESET:
                return {
                    title: "Confirmar Reseteo de Contraseña",
                    message: `Se generará una nueva contraseña aleatoria para ${targetUsuario.nombre}. ¿Desea continuar?`,
                    confirmText: "Resetear Contraseña",
                    confirmButtonClass: "btn-warning",
                    useInputModal: false,
                };
            case ACTION_DELETE:
                return {
                    title: "Confirmar Eliminación Lógica",
                    message: `¿Está seguro de que desea ELIMINAR LÓGICAMENTE la cuenta de ${targetUsuario.nombre}? El usuario deberá contactar a un administrador para reactivarla.`,
                    confirmText: "Eliminar Cuenta",
                    confirmButtonClass: "btn-dark", 
                    useInputModal: false,
                };
            case ACTION_BLOCK:
                if (targetUsuario.estado_cuenta === 'Activo') {
                    // Bloqueo
                    return {
                        title: "Confirmar Sanción de Bloqueo",
                        message: `Defina la duración de la sanción para ${targetUsuario.nombre} e ingrese el motivo.`,
                        confirmText: "🚫 Bloquear Cuenta",
                        confirmButtonClass: "btn-danger",
                        inputLabel: 'Motivo del Bloqueo',
                        isInputRequired: true,
                        durations: BLOCK_DURATIONS,
                        useInputModal: true,
                    };
                } else {
                    // Desbloqueo/Reactivación
                    return {
                        title: targetUsuario.estado_cuenta === 'Bloqueado' ? "Confirmar Desbloqueo" : "Confirmar Reactivación",
                        message: `¿Está seguro de que desea ${targetUsuario.estado_cuenta === 'Bloqueado' ? 'desbloquear' : 'reactivar'} la cuenta de ${targetUsuario.nombre}?`,
                        confirmText: targetUsuario.estado_cuenta === 'Bloqueado' ? "🔓 Desbloquear" : "🔄 Reactivar",
                        confirmButtonClass: "btn-success",
                        useInputModal: false,
                    };
                }
            default:
                return {};
        }
    }, [targetUsuario, currentAction]);

    // --- 9. Retorno del Hook ---
    return {
        // Data & UI State
        usuarios: usuariosFiltrados,
        loading,
        mensaje,
        
        // Filter State
        filtroTipo,
        setFiltroTipo,
        
        // Message Handler
        clearMessage,
        
        // Modal State & Handlers
        showConfirmModal,
        targetUsuario,
        modalProps,
        openConfirmModal,
        closeConfirmModal,
        handleConfirmAction,
        
        // Actions Constants
        ACTION_RESET,
        ACTION_DELETE,
        ACTION_BLOCK,

        // Permissions & Auth Status
        puedeVer,
        puedeBloquear,
        puedeEliminar,
        puedeResetear,
        isLoadingAuth: isLoading,
    };
};

export default useUsuarios;