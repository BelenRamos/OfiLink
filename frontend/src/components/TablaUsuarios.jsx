import React from 'react';
import UsuarioFilaAcciones from './UsuarioFilaAcciones'; 

/**
 * Componente para renderizar la tabla completa de usuarios.
 *
 * @param {object} props
 * @param {Array<object>} props.usuarios - Lista de usuarios a mostrar (ya filtrada).
 * @param {function} props.openConfirmModal - Handler para abrir el modal de confirmación.
 * @param {string} props.ACTION_RESET - Constante para la acción de reseteo.
 * @param {string} props.ACTION_BLOCK - Constante para la acción de bloqueo.
 * @param {string} props.ACTION_DELETE - Constante para la acción de eliminación.
 * @param {boolean} props.puedeResetear - Permiso para resetear contraseña.
 * @param {boolean} props.puedeBloquear - Permiso para bloquear/desbloquear.
 * @param {boolean} props.puedeEliminar - Permiso para eliminar.
 */
const TablaUsuarios = ({
    usuarios,
    openConfirmModal,
    ACTION_RESET,
    ACTION_BLOCK,
    ACTION_DELETE,
    puedeResetear,
    puedeBloquear,
    puedeEliminar,
}) => {

    if (!usuarios || usuarios.length === 0) {
        return <p className="mt-4 alert alert-warning">No hay usuarios que coincidan con el filtro.</p>;
    }

    return (
        <table className="table table-bordered table-striped mt-3">
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
                {usuarios.map(usuario => (
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
                        {/* Delegamos el renderizado de los botones al subcomponente */}
                        <UsuarioFilaAcciones
                            usuario={usuario}
                            openConfirmModal={openConfirmModal}
                            ACTION_RESET={ACTION_RESET}
                            ACTION_BLOCK={ACTION_BLOCK}
                            ACTION_DELETE={ACTION_DELETE}
                            puedeResetear={puedeResetear}
                            puedeBloquear={puedeBloquear}
                            puedeEliminar={puedeEliminar}
                        />
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default TablaUsuarios;