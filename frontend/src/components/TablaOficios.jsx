import React from 'react';
import PropTypes from 'prop-types';

/**
 * Componente de presentación para la tabla de oficios (versión mejorada visualmente).
 * Mantiene la lógica intacta, solo ajusta estilos y presentación.
 */
const TablaOficios = ({
  oficios,
  puedeEditar,
  puedeEliminar,
  handleEditClick,
  handleOpenConfirmDelete,
}) => {
  return (
    <div className="table-responsive mt-3 shadow-sm rounded-3">
      <table className="table table-hover align-middle mb-0">
        <thead className="table-light text-center">
          <tr>
            <th style={{ width: '10%' }}>ID</th>
            <th style={{ width: '25%' }}>Nombre</th>
            <th>Descripción</th>
            <th style={{ width: '20%' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {oficios.length > 0 ? (
            oficios.map((oficio) => (
              <tr key={oficio.Id}>
                <td className="fw-semibold text-center">{oficio.Id}</td>
                <td>{oficio.Nombre}</td>
                <td className="text-muted">
                  {oficio.Descripcion || (
                    <span className="fst-italic text-secondary">
                      Sin descripción
                    </span>
                  )}
                </td>
                <td className="text-nowrap text-center">
                  {puedeEditar && (
                    <button
                      className="btn btn-outline-primary btn-sm me-2"
                      onClick={() => handleEditClick(oficio)}
                      title="Editar oficio"
                    >
                      ✏️ Editar
                    </button>
                  )}
                  {puedeEliminar && (
                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => handleOpenConfirmDelete(oficio)}
                      title="Eliminar oficio"
                    >
                      🗑️ Eliminar
                    </button>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center py-4 text-muted fst-italic">
                No hay oficios registrados.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

TablaOficios.propTypes = {
  oficios: PropTypes.array.isRequired,
  puedeEditar: PropTypes.bool.isRequired,
  puedeEliminar: PropTypes.bool.isRequired,
  handleEditClick: PropTypes.func.isRequired,
  handleOpenConfirmDelete: PropTypes.func.isRequired,
};

export default TablaOficios;
