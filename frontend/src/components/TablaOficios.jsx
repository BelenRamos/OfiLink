import React from 'react';
import PropTypes from 'prop-types';

/**
 * Componente de presentación para la tabla de oficios.
 * Muestra la lista y los botones de acción basados en permisos.
 */
const TablaOficios = ({ 
    oficios, 
    puedeEditar, 
    puedeEliminar, 
    handleEditClick, 
    handleOpenConfirmDelete 
}) => {
    return (
        <table className="table table-bordered table-striped">
            <thead className="table-light">
                <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Descripción</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                {oficios.length > 0 ? (
                    oficios.map((oficio) => (
                        <tr key={oficio.Id}>
                            <td>{oficio.Id}</td>
                            <td>{oficio.Nombre}</td>
                            <td>{oficio.Descripcion || <span className="text-muted">Sin descripción</span>}</td>
                            <td className="text-nowrap">
                                {puedeEditar && (
                                <button
                                    className="btn btn-sm btn-info me-2"
                                    onClick={() => handleEditClick(oficio)}
                                >
                                    ✏️ Editar
                                </button>
                                )}
                                {puedeEliminar && (
                                <button
                                    className="btn btn-sm btn-danger"
                                    onClick={() => handleOpenConfirmDelete(oficio)}
                                >
                                    🗑️ Eliminar
                                </button>
                                )}
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="4" className="text-center">No hay oficios registrados.</td>
                    </tr>
                )}
            </tbody>
        </table>
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