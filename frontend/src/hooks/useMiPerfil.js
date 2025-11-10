import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../utils/apiFetch'; 

/**
 * Hook personalizado para manejar la lógica del perfil del usuario (MiPerfil).
 * Se encarga de la carga de datos, estados de edición y handlers de actualización/eliminación.
 * @param {object} authContext Contiene usuario (usuarioContext), logoutUser, tienePermiso, isLoading de useAuth.
 * @returns {object} Todos los estados y handlers necesarios para la UI.
 */
const useMiPerfil = ({ usuarioContext, logoutUser, tienePermiso, isLoading }) => {
    const navigate = useNavigate();
    
    // --- 1. Estados de Datos y Visualización ---
    const [usuario, setUsuario] = useState(null);
    const [perfilTrabajador, setPerfilTrabajador] = useState(null);
    const [contrataciones, setContrataciones] = useState([]);
    const [mensaje, setMensaje] = useState(''); 
    
    // Estados de control UI
    const [isEditing, setIsEditing] = useState(false); 
    const [isWorkerEditing, setIsWorkerEditing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false); 
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Permisos
    const PERMISO_VER_PERFIL = 'ver_mi_perfil';
    const PERMISO_EDITAR_PERFIL = 'editar_mi_perfil';
    const puedeVer = tienePermiso(PERMISO_VER_PERFIL);
    const puedeEditar = tienePermiso(PERMISO_EDITAR_PERFIL);

    // --- 2. Handlers de Actualización (Optimizados con useCallback) ---

    const handlePerfilUpdate = useCallback((datosActualizados) => {
        setUsuario(prevUsuario => {
            const nuevoUsuario = { 
                ...prevUsuario, 
                ...datosActualizados 
            };
            // Actualizar también en localStorage para persistencia de sesión
            localStorage.setItem('usuarioActual', JSON.stringify(nuevoUsuario));
            return nuevoUsuario;
        });
        setMensaje('¡Perfil actualizado con éxito!');
        setIsEditing(false);
    }, []);
    
    const handleWorkerPerfilUpdate = useCallback((datosActualizados) => {
        setPerfilTrabajador(datosActualizados);
        setMensaje('¡Perfil de trabajador actualizado con éxito!');
        setIsWorkerEditing(false); 
    }, []);
    
    const handleFotoUpdate = useCallback((nuevaUrl) => {
        setUsuario(prevUsuario => {
            const nuevoUsuario = { ...prevUsuario, foto_url: nuevaUrl };
            localStorage.setItem('usuarioActual', JSON.stringify(nuevoUsuario));
            return nuevoUsuario;
        });
        
        setPerfilTrabajador(prevPerfil => {
            if (prevPerfil) {
                return { ...prevPerfil, foto_url: nuevaUrl };
            }
            return null; // Si no era trabajador, no hacemos nada
        });

        setMensaje('¡Foto de perfil actualizada!');
    }, []);

    // --- 3. Handlers de Eliminación de Cuenta ---

    const handleEliminarCuenta = useCallback(() => {
        if (!usuario || !usuario.id || isDeleting) return;
        setShowDeleteModal(true);
    }, [usuario, isDeleting]);

    const executeEliminarCuenta = useCallback(async () => {
        setShowDeleteModal(false);
        setIsDeleting(true); 

        try {
            await apiFetch(`/api/personas/mi-perfil/eliminar`, { 
                method: 'PUT',
                body: JSON.stringify({ motivo: "Eliminación de cuenta por el propio usuario" }),
            });
            
            await logoutUser(); 
            setMensaje('Su cuenta ha sido eliminada exitosamente. Redirigiendo...');
        
        } catch (error) {
            console.error('Error al eliminar la cuenta:', error);
            setMensaje(`Error al eliminar la cuenta: ${error.message || 'Error de conexión.'}`);
            setIsDeleting(false); 
        }
    }, [logoutUser]);

    // --- 4. Efecto de Carga de Datos Iniciales ---

    useEffect(() => {
        // 1. Manejo de permisos y estado de eliminación
        if (!puedeVer || isDeleting) {
            if (isDeleting) return; 
            
            // Si el usuarioContext no está cargado y no puede ver, se permite la carga para verificar
            if (!isLoading && !usuarioContext && !localStorage.getItem('usuarioActual')) {
                navigate('/login'); 
                return;
            }
            // Si no tiene permiso pero la carga terminó, permitimos que el render muestre el mensaje de "no tiene permiso"
            if (!isLoading && !puedeVer) return;
        }

        // 2. Obtener el usuario inicial (Contexto > LocalStorage)
        const parsedUsuario = usuarioContext || JSON.parse(localStorage.getItem('usuarioActual'));
        
        if (!parsedUsuario) {
            // Si después de todas las comprobaciones no hay usuario, redirigir
            if (!isLoading) navigate('/login');
            return;
        }
        
        const cargarDatos = async () => {
            try {
                // A. Cargar datos de Persona
                const dataPersona = await apiFetch(`/api/personas/${parsedUsuario.id}`);
                
                if (dataPersona.estado_cuenta === 'Eliminado') {
                    logoutUser(); 
                    setMensaje("Su cuenta ha sido marcada como eliminada. Contacte a un administrador para reactivarla.");
                    setTimeout(() => navigate('/login'), 3000);
                    return;
                }
                
                const usuarioActualizado = {
                    ...parsedUsuario, 
                    ...dataPersona, 
                    // Asegurarse de que roles_keys no se pierdan si apiFetch no los devuelve
                    roles_keys: parsedUsuario.roles_keys || dataPersona.roles_keys
                };

                setUsuario(usuarioActualizado);
                localStorage.setItem('usuarioActual', JSON.stringify(usuarioActualizado)); 

                // B. Cargar datos de Trabajador (si aplica)
                if (usuarioActualizado.roles_keys?.includes('trabajador')) {
                    const dataTrabajador = await apiFetch(`/api/trabajadores/${usuarioActualizado.id}`);
                    setPerfilTrabajador(dataTrabajador); 
                } else {
                    setPerfilTrabajador(null); // Asegurar que es null si no es trabajador
                }

                // C. Cargar datos de Contrataciones (si aplica)
                if (usuarioActualizado.roles_keys?.includes('cliente')) {
                    const dataContrataciones = await apiFetch('/api/contrataciones');
                    setContrataciones(dataContrataciones);
                } else {
                    setContrataciones([]);
                }
            } catch (err) {
                console.error('Error cargando datos:', err);
                setMensaje('Error al cargar los datos del perfil.');
            }
        };

        cargarDatos();
        
    }, [navigate, usuarioContext, logoutUser, isDeleting, puedeVer, isLoading]); // Dependencias

    // --- 5. Retorno del Hook ---
    return {
        // Estados de Datos
        usuario,
        perfilTrabajador,
        contrataciones,
        mensaje,
        
        // Estados de Control UI
        isEditing,
        isWorkerEditing,
        isDeleting,
        showDeleteModal,

        // Setters de Control UI
        setIsEditing,
        setIsWorkerEditing,
        setShowDeleteModal,

        // Handlers de Lógica
        handlePerfilUpdate,
        handleWorkerPerfilUpdate,
        handleFotoUpdate,
        handleEliminarCuenta,
        executeEliminarCuenta,
        
        // Permisos y Carga
        puedeEditar,
        puedeVer,
        isLoadingAuth: isLoading,
    };
};

export default useMiPerfil;