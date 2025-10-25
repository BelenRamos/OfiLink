import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../utils/apiFetch';
import GenericConfirmModal from '../../components/GenericConfirmModal';
import ConfirmBlockModal from '../../components/ConfirmBlockModal';
import { useAuth } from '../../hooks/useAuth';

// Definición de las acciones que requieren confirmación
const ACTION_RESET = 'reset';
const ACTION_DELETE = 'delete';
const ACTION_BLOCK = 'block';
//const ACTION_REACTIVATE = 'reactivate';

const BLOCK_DURATIONS = [
    { value: '2', label: '2 días' }, 
    { value: '5', label: '5 días' }, 
    { value: '30', label: '1 mes (30 días)' },
    { value: 'indefinido', label: 'Bloqueo Indefinido' } 
];

const Usuarios = () => {
    const { tienePermiso, isLoading } = useAuth(); 
    
    const [usuarios, setUsuarios] = useState([]);
    const [filtroTipo, setFiltroTipo] = useState('');
    const [mensaje, setMensaje] = useState('');

    // ESTADOS PARA EL MODAL DE CONFIRMACIÓN
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [currentAction, setCurrentAction] = useState(null); 
    const [targetUsuario, setTargetUsuario] = useState(null); // A qué usuario afecta

    const PERMISO_VER_VISTA = 'ver_usuarios';
    const PERMISO_BLOQUEAR = 'bloquear_usuario';
    const PERMISO_ELIMINAR = 'eliminar_usuario';
    const PERMISO_RESET = 'resetear_pass';

    useEffect(() => {
        if (!isLoading && tienePermiso(PERMISO_VER_VISTA)) {
            fetchUsuarios();
        }
    }, [isLoading, tienePermiso]);

    // Función auxiliar para el manejo detallado de errores (replicado de Oficios)
    const extractErrorMessage = (error, defaultMessage) => {
        const errorBody = error.response || {};
        const errorMessage = errorBody.error || defaultMessage;
        return errorMessage + (errorBody.details ? ` (${errorBody.details})` : '');
    };

    const fetchUsuarios = async () => {
        if (!tienePermiso(PERMISO_VER_VISTA)) {
            setMensaje('No tiene permiso para ver la lista de usuarios.');
            return;
        }

        try {
            const response = await apiFetch('/api/personas'); 
            setUsuarios(response); 
            //setMensaje('');
        } catch (error) {
            const fullMessage = extractErrorMessage(error, 'Error al cargar la lista de usuarios.');
            console.error('Error al cargar usuarios:', error);
            setMensaje(fullMessage);
        }
    };

    // --- MANEJO DE MODAL GENÉRICO ---
    const openConfirmModal = (action, usuario) => {
        setCurrentAction(action);
        setTargetUsuario(usuario);
        setShowConfirmModal(true);
    };

    const closeConfirmModal = () => {
        setShowConfirmModal(false);
        setCurrentAction(null);
        setTargetUsuario(null);
    };

    //ACCIÓN: Resetear Contraseña
    const resetearContraseña = async (id) => {
        if (!tienePermiso(PERMISO_RESET)) { 
             setMensaje('Acción denegada: No tiene permiso para resetear contraseñas.');
             return;
        }
        try {
            const response = await apiFetch(`/api/personas/${id}/reset-password`, {
                method: 'PUT',
                body: {}
            });
            setMensaje(`Nueva contraseña para ID ${id}: ${response.nuevaPassword}`);
            fetchUsuarios(); 
        } catch (error) {
            const fullMessage = extractErrorMessage(error, 'Error al resetear la contraseña.');
            console.error('Error al resetear contraseña:', error);
            setMensaje(fullMessage);
        }
    };

    //Eliminar Cuenta 
    const eliminarCuenta = async (usuarioId) => {
        if (!tienePermiso(PERMISO_ELIMINAR)) { 
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
            
            setMensaje(`La cuenta con ID ${usuarioId} fue marcada como eliminada.`);
            fetchUsuarios(); 
            
        } catch (error) {
            const fullMessage = extractErrorMessage(error, 'Error al eliminar la cuenta.');
            console.error('Error al eliminar la cuenta:', error);
            setMensaje(fullMessage);
        }
    };

    //Toggle Bloqueo 
    const toggleBloqueo = async (usuario, motivo = null, duracionBloqueoDias = null) => {
        const nuevoEstado = usuario.estado_cuenta === 'Activo' ? 'Bloqueado' : 'Activo';
        const accion = nuevoEstado === 'Bloqueado' ? 'bloquear' : 'desbloquear';

        if (accion === 'bloquear' && !tienePermiso(PERMISO_BLOQUEAR)) { // 5. Chequeo de permiso para bloquear
             setMensaje('Acción denegada: No tiene permiso para bloquear usuarios.');
             return;
        }

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
                 mensajeExito = `La cuenta de ${usuario.nombre} fue ${accion === 'bloquear' ? 'bloqueada' : 'desbloqueada'} exitosamente.`;
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
    }

    const handleConfirmAction = async (motivo = null, duracion = null) => { 
        closeConfirmModal(); 

        if (!targetUsuario) return;
      
        switch (currentAction) {
            case ACTION_RESET:
                await resetearContraseña(targetUsuario.id);
                break;
            case ACTION_DELETE:
                // La eliminación lógica es con PUT, no necesita body en el backend
                await eliminarCuenta(targetUsuario.id); 
                break;
            case ACTION_BLOCK:
                //Pasamos motivo Y finalDuracion a toggleBloqueo
                await toggleBloqueo(targetUsuario, motivo, duracion);
                break;
            default:
                break;
        }
    };

    let modalProps = {};
    let useInputModal = false;

    if (targetUsuario) {
        switch (currentAction) {
            case ACTION_RESET:
                modalProps = {
                    title: "Confirmar Reseteo de Contraseña",
                    message: `Se generará una nueva contraseña aleatoria para ${targetUsuario.nombre}. ¿Desea continuar?`,
                    confirmText: "Resetear Contraseña",
                    confirmButtonClass: "btn-warning"
                };
                break;
            case ACTION_DELETE:
                modalProps = {
                    title: "Confirmar Eliminación Lógica",
                    message: `¿Está seguro de que desea ELIMINAR LÓGICAMENTE la cuenta de ${targetUsuario.nombre}? El usuario deberá contactar a un administrador para reactivarla.`,
                    confirmText: "Eliminar Cuenta",
                    confirmButtonClass: "btn-danger"
                };
                break;
            case ACTION_BLOCK:
                if (targetUsuario.estado_cuenta === 'Activo') {
                    useInputModal = true; 
                    modalProps = {
                        title: "Confirmar Sanción de Bloqueo",
                        message: `Defina la duración de la sanción para ${targetUsuario.nombre} e ingrese el motivo.`,
                        confirmText: "🚫 Bloquear Cuenta",
                        confirmButtonClass: "btn-danger",
                        inputLabel: 'Motivo del Bloqueo',
                        isInputRequired: true,
                        durations: BLOCK_DURATIONS 
                    };} else {
                        // Desbloqueo/Reactivación
                        modalProps = {
                            title: targetUsuario.estado_cuenta === 'Bloqueado' ? "Confirmar Desbloqueo" : "Confirmar Reactivación",
                            message: `¿Está seguro de que desea ${targetUsuario.estado_cuenta === 'Bloqueado' ? 'desbloquear' : 'reactivar'} la cuenta de ${targetUsuario.nombre}?`,
                            confirmText: targetUsuario.estado_cuenta === 'Bloqueado' ? "Desbloquear" : "Reactivar",
                            confirmButtonClass: "btn-success"
                        };
                }
                break;
            default:
                break;
        }
    }

    const usuariosFiltrados = filtroTipo
        ? usuarios.filter(u => u.tipo === filtroTipo)
        : usuarios;

    if (isLoading) return <p className="mt-4">Cargando permisos...</p>;

    if (!tienePermiso(PERMISO_VER_VISTA)) {
        return <h2 className="mt-4">No tienes permiso para ver la gestión de usuarios.</h2>;
    }

   return (
        <div className="container mt-4">
            <h2>Gestión de Usuarios</h2>
            {mensaje && <div className="alert alert-info">{mensaje}</div>}

            <div className="d-flex justify-content-between align-items-center mb-3">
                <label className="form-label">Filtrar por tipo:</label>
                <select
                    className="form-select w-auto"
                    value={filtroTipo}
                    onChange={e => setFiltroTipo(e.target.value)}
                >
                    <option value="">Todos</option>
                    <option value="cliente">Clientes</option>
                    <option value="trabajador">Trabajadores</option>
                </select>
            </div>

            <table className="table table-bordered table-striped">
                <thead className="table-light">
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Email</th>
                        <th>Tipo</th>
                        <th>Estado</th> 
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {usuariosFiltrados.map(usuario => (
                        <tr key={usuario.id}>
                            <td>{usuario.id}</td>
                            <td>{usuario.nombre}</td>
                            <td>{usuario.mail}</td>
                            <td>{usuario.tipo}</td>
                            <td>
                                <span className={`badge ${usuario.estado_cuenta === 'Activo' ? 'bg-success' : 'bg-danger'}`}>
                                    {usuario.estado_cuenta}
                                </span>
                            </td>
                            <td>
                                {tienePermiso(PERMISO_RESET) && (
                                    <button
                                        className="btn btn-sm btn-warning me-2"
                                        onClick={() => openConfirmModal(ACTION_RESET, usuario)} 
                                    >
                                        🔑 Resetear
                                    </button>
                                )}

                                {/* GESTIÓN DE ESTADO (Bloqueo/Desbloqueo) */}
                                {usuario.estado_cuenta !== 'Eliminado' && (
                                    <button
                                        className={`btn btn-sm ${usuario.estado_cuenta === 'Activo' ? 'btn-danger' : 'btn-success'}`}
                                        onClick={() => openConfirmModal(ACTION_BLOCK, usuario)} 
                                        disabled={usuario.estado_cuenta === 'Activo' && !tienePermiso(PERMISO_BLOQUEAR)}
                                    >
                                        {usuario.estado_cuenta === 'Activo' ? '🚫 Bloquear' : '🔓 Desbloquear'}
                                    </button>
                                )}
                                
                                {/* BOTÓN DE REACTIVAR, solo si el estado es Eliminado */}
                                {usuario.estado_cuenta === 'Eliminado' && (
                                    <button
                                        className="btn btn-sm btn-success"
                                        onClick={() => openConfirmModal(ACTION_BLOCK, usuario)} 
                                        disabled={!tienePermiso(PERMISO_BLOQUEAR)}
                                    >
                                        🔄 Reactivar
                                    </button>
                                )}

                                {usuario.estado_cuenta !== 'Eliminado' && tienePermiso(PERMISO_ELIMINAR) && (
                                    <button
                                        className="btn btn-sm btn-dark ms-2"
                                        onClick={() => openConfirmModal(ACTION_DELETE, usuario)} 
                                    >
                                        🗑️ Eliminar
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

          
            {/* Modal para acciones que requieren input (SOLO BLOQUEO) */}
            {useInputModal && targetUsuario && (
                <ConfirmBlockModal
                    show={showConfirmModal}
                    onClose={closeConfirmModal}
                    onConfirm={handleConfirmAction} // Pasará el motivo como argumento
                    {...modalProps}
                />
            )}

            {/* Modal para acciones simples (RESET, DELETE, DESBLOQUEO/REACTIVACIÓN) */}
            {!useInputModal && (
                <GenericConfirmModal
                    show={showConfirmModal}
                    onClose={closeConfirmModal}
                    onConfirm={() => handleConfirmAction(null, null)} 
                    {...modalProps}
                />
            )}
        </div>
    );
};


export default Usuarios;