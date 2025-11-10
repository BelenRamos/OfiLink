import React from 'react';

/**
 * Componente que renderiza los botones de acción (Resetear, Bloquear, Eliminar, Reactivar) 
 * para un usuario específico en la tabla.
 *
 * @param {object} props
 * @param {object} props.usuario - El objeto usuario actual.
 * @param {function} props.openConfirmModal - Handler para abrir el modal de confirmación.
 * @param {string} props.ACTION_RESET - Constante para la acción de reseteo.
 * @param {string} props.ACTION_BLOCK - Constante para la acción de bloqueo.
 * @param {string} props.ACTION_DELETE - Constante para la acción de eliminación.
 * @param {boolean} props.puedeResetear - Permiso para resetear contraseña.
 * @param {boolean} props.puedeBloquear - Permiso para bloquear/desbloquear.
 * @param {boolean} props.puedeEliminar - Permiso para eliminar.
 */
const UsuarioFilaAcciones = ({
    usuario,
    openConfirmModal,
    ACTION_RESET,
    ACTION_BLOCK,
    ACTION_DELETE,
    puedeResetear,
    puedeBloquear,
    puedeEliminar,
}) => {
    const estado = usuario.estado_cuenta;
    const esEliminado = estado === 'Eliminado';
    const esActivo = estado === 'Activo';

    return (
        <td className="text-nowrap">
            {/* Resetear Contraseña */}
            {puedeResetear && (
                <button
                    className="btn btn-sm btn-warning me-2"
                    onClick={() => openConfirmModal(ACTION_RESET, usuario)} 
                >
                    🔑 Resetear
                </button>
            )}

            {/* GESTIÓN DE ESTADO (Bloqueo/Desbloqueo) */}
            {!esEliminado ? (
                <button
                    className={`btn btn-sm ${esActivo ? 'btn-danger' : 'btn-success'}`}
                    onClick={() => openConfirmModal(ACTION_BLOCK, usuario)} 
                    disabled={esActivo && !puedeBloquear}
                >
                    {esActivo ? '🚫 Bloquear' : '🔓 Desbloquear'}
                </button>
            ) : (
                /* BOTÓN DE REACTIVAR, solo si el estado es Eliminado */
                <button
                    className="btn btn-sm btn-success"
                    onClick={() => openConfirmModal(ACTION_BLOCK, usuario)} 
                    disabled={!puedeBloquear}
                >
                    🔄 Reactivar
                </button>
            )}

            {/* Eliminación Lógica */}
            {!esEliminado && puedeEliminar && (
                <button
                    className="btn btn-sm btn-dark ms-2"
                    onClick={() => openConfirmModal(ACTION_DELETE, usuario)} 
                >
                    🗑️ Eliminar
                </button>
            )}
        </td>
    );
};

export default UsuarioFilaAcciones;