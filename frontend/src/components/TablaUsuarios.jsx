import React from 'react';
import UsuarioFilaAcciones from './UsuarioFilaAcciones'; 

/**
 * Componente para renderizar la tabla completa de usuarios con estilo mejorado.
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
    return (
      <div className="alert alert-warning mt-4 text-center shadow-sm rounded-3">
        No hay usuarios que coincidan con el filtro.
      </div>
    );
  }

  return (
    <div className="table-responsive mt-4 shadow-sm rounded-3">
      <table className="table align-middle mb-0 table-hover">
        <thead className="table-light text-center">
          <tr>
            <th style={{ width: "5%" }}>ID</th>
            <th style={{ width: "25%" }}>Nombre</th>
            <th style={{ width: "25%" }}>Email</th>
            <th style={{ width: "15%" }}>Tipo</th>
            <th style={{ width: "15%" }}>Estado</th>
            <th style={{ width: "15%" }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((usuario) => (
            <tr key={usuario.id} className="text-center">
              <td className="fw-semibold">{usuario.id}</td>
              <td className="text-start">{usuario.nombre}</td>
              <td className="text-start text-muted">{usuario.mail}</td>
              <td>
                <span className="badge bg-secondary">{usuario.tipo}</span>
              </td>
              <td>
                <span
                  className={`badge px-3 py-2 rounded-pill ${
                    usuario.estado_cuenta === 'Activo'
                      ? 'bg-success'
                      : 'bg-danger'
                  }`}
                >
                  {usuario.estado_cuenta}
                </span>
              </td>

              {/* Subcomponente para las acciones */}
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
    </div>
  );
};

export default TablaUsuarios;
