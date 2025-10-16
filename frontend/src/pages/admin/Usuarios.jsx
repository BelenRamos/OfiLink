import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../utils/apiFetch';
import GenericConfirmModal from '../../components/GenericConfirmModal'; // 💡 IMPORTAMOS EL NUEVO MODAL

// Definición de las acciones que requieren confirmación
const ACTION_RESET = 'reset';
const ACTION_DELETE = 'delete';
const ACTION_BLOCK = 'block';

const Usuarios = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [filtroTipo, setFiltroTipo] = useState('');
    const [mensaje, setMensaje] = useState('');

    // 💡 ESTADOS PARA EL MODAL DE CONFIRMACIÓN
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [currentAction, setCurrentAction] = useState(null); // Qué acción ejecutar (reset, delete, block)
    const [targetUsuario, setTargetUsuario] = useState(null); // A qué usuario afecta

    useEffect(() => {
        fetchUsuarios();
    }, []);

    // Función auxiliar para el manejo detallado de errores (replicado de Oficios)
    const extractErrorMessage = (error, defaultMessage) => {
        const errorBody = error.response || {};
        const errorMessage = errorBody.error || defaultMessage;
        return errorMessage + (errorBody.details ? ` (${errorBody.details})` : '');
    };

    const fetchUsuarios = async () => {
        try {
            const response = await apiFetch('/api/personas'); 
            setUsuarios(response); 
            setMensaje('');
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

    // --- ACCIÓN: Resetear Contraseña (sin cambios en la lógica interna) ---
    const resetearContraseña = async (id) => {
        try {
            const response = await apiFetch(`/api/personas/${id}/reset-password`, {
                method: 'PUT'
            });
            setMensaje(`Nueva contraseña para ID ${id}: ${response.nuevaPassword}`);
            fetchUsuarios(); 
        } catch (error) {
            const fullMessage = extractErrorMessage(error, 'Error al resetear la contraseña.');
            console.error('Error al resetear contraseña:', error);
            setMensaje(fullMessage);
        }
    };

    // --- ACCIÓN: Eliminar Cuenta (sin cambios en la lógica interna) ---
    const eliminarCuenta = async (usuarioId) => {
        try {
            await apiFetch(`/api/personas/${usuarioId}/eliminar`, {
                method: 'PUT'
            });
            
            setMensaje(`La cuenta con ID ${usuarioId} fue marcada como eliminada.`);
            fetchUsuarios(); 
            
        } catch (error) {
            const fullMessage = extractErrorMessage(error, 'Error al eliminar la cuenta.');
            console.error('Error al eliminar la cuenta:', error);
            setMensaje(fullMessage);
        }
    };

    // --- ACCIÓN: Toggle Bloqueo (sin cambios en la lógica interna) ---
    const toggleBloqueo = async (usuario, motivo = null) => {
        const nuevoEstado = usuario.estado_cuenta === 'Activo' ? 'Bloqueado' : 'Activo';
        const accion = nuevoEstado === 'Bloqueado' ? 'bloquear' : 'desbloquear';

        try {
            await apiFetch(`/api/personas/${usuario.id}/estado`, {
                method: 'PUT',
                body: { 
                    nuevoEstado: nuevoEstado,
                    motivo: motivo || "" // Pasamos el motivo si existe
                }
            });

            let mensajeExito;
            if (usuario.estado_cuenta === 'Eliminado') {
                mensajeExito = `La cuenta de ${usuario.nombre} fue reactivada exitosamente.`;
            } else {
                mensajeExito = `La cuenta de ${usuario.nombre} fue ${accion === 'bloquear' ? 'bloqueada' : 'desbloqueada'} exitosamente.`;
            }
            setMensaje(mensajeExito);
            fetchUsuarios(); 

        } catch (error) {
            const fullMessage = extractErrorMessage(error, `Error al ${accion} la cuenta.`);
            console.error('Error al cambiar el estado de la cuenta:', error);
            setMensaje(fullMessage);
        }
    }

    // --- MANEJO DE ACCIONES DEL MODAL (DISPATCHER) ---
    // Esta función determina qué acción se ejecuta cuando el usuario confirma en el modal.
    const handleConfirmAction = async (motivo) => {
        closeConfirmModal(); 

        if (!targetUsuario || !currentAction) return;

        switch (currentAction) {
            case ACTION_RESET:
                await resetearContraseña(targetUsuario.id);
                break;
            case ACTION_DELETE:
                await eliminarCuenta(targetUsuario.id);
                break;
            case ACTION_BLOCK:
                // Solo se llama al bloqueo si la acción no es 'Reactivar'
                await toggleBloqueo(targetUsuario, motivo);
                break;
            default:
                break;
        }
    };

    // --- Renderizado y Lógica del Modal (para el JSX) ---
    let modalProps = {};
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
                    // Bloqueo, requiere input (usaremos prompt temporalmente hasta tener un modal más complejo)
                    const motivo = prompt(`Ingrese el motivo para bloquear a ${targetUsuario.nombre}:`);
                    if (motivo) {
                        handleConfirmAction(motivo);
                    }
                    return null; // Evita renderizar el modal genérico
                } else {
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
    // ----------------------------------------------------

    const usuariosFiltrados = filtroTipo
        ? usuarios.filter(u => u.tipo === filtroTipo)
        : usuarios;

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
                {/* ... (Tabla head y body) ... */}
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
                                <button
                                    className="btn btn-sm btn-warning me-2"
                                    onClick={() => openConfirmModal(ACTION_RESET, usuario)} // 💡 Usar el modal
                                >
                                    🔑 Resetear
                                </button>

                                {/* GESTIÓN DE ESTADO (Activo/Bloqueado/Desbloqueo) */}
                                {usuario.estado_cuenta !== 'Eliminado' && (
                                    <button
                                        className={`btn btn-sm ${usuario.estado_cuenta === 'Activo' ? 'btn-danger' : 'btn-success'}`}
                                        onClick={() => openConfirmModal(ACTION_BLOCK, usuario)} // 💡 Usar el modal
                                    >
                                        {usuario.estado_cuenta === 'Activo' ? '🚫 Bloquear' : '🔓 Desbloquear'}
                                    </button>
                                )}
                                
                                {/*BOTÓN DE REACTIVAR, solo si el estado es Eliminado*/}
                                {usuario.estado_cuenta === 'Eliminado' && (
                                    <button
                                        className="btn btn-sm btn-success"
                                        onClick={() => openConfirmModal(ACTION_BLOCK, { ...usuario, estado_cuenta: 'Bloqueado' })} // 💡 Simular desbloqueo para reactivar
                                    >
                                        🔄 Reactivar
                                    </button>
                                )}

                                {usuario.estado_cuenta !== 'Eliminado' && (
                                    <button
                                        className="btn btn-sm btn-dark ms-2"
                                        onClick={() => openConfirmModal(ACTION_DELETE, usuario)} // 💡 Usar el modal
                                    >
                                        🗑️ Eliminar
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* 💡 RENDERIZAR EL MODAL GENÉRICO */}
            <GenericConfirmModal
                show={showConfirmModal}
                onClose={closeConfirmModal}
                onConfirm={() => handleConfirmAction(null)} // El motivo de bloqueo se maneja antes (ver nota)
                {...modalProps}
            />
        </div>
    );
};


export default Usuarios;