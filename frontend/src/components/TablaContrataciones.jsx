import React from 'react';

/**
 * Componente de presentación para el listado de Contrataciones (versión mejorada visualmente).
 */
const TablaContrataciones = ({ contrataciones, todasContrataciones, error }) => {
  
  if (todasContrataciones.length === 0 && !error) {
    return (
      <div className="alert alert-info mt-3 text-center">
        No se encontraron contrataciones para mostrar.
      </div>
    );
  }

  if (contrataciones.length === 0 && todasContrataciones.length > 0) {
    return (
      <div className="alert alert-warning mt-3 text-center">
        No hay contrataciones que coincidan con el estado seleccionado.
      </div>
    );
  }

  return (
    <div className="table-responsive mt-3 shadow-sm rounded-3">
      <table className="table table-hover align-middle mb-0">
        <thead className="table-light text-center">
          <tr>
            <th style={{ width: '8%' }}>ID</th>
            <th>Cliente</th>
            <th>Trabajador</th>
            <th style={{ width: '15%' }}>Estado</th>
            <th style={{ width: '15%' }}>Fecha inicio</th>
            <th style={{ width: '15%' }}>Fecha fin</th>
          </tr>
        </thead>
        <tbody>
          {contrataciones.map((c) => (
            <tr key={c.id}>
              <td className="fw-semibold text-center">{c.id}</td>
              <td>{c.cliente}</td>
              <td>{c.trabajador}</td>
              <td className="text-center">
                <span
                  className={`badge ${
                    c.estado === 'Finalizada'
                      ? 'bg-success'
                      : c.estado === 'Cancelada'
                      ? 'bg-danger'
                      : c.estado === 'En curso'
                      ? 'bg-warning text-dark'
                      : 'bg-secondary'
                  }`}
                >
                  {c.estado}
                </span>
              </td>
              <td className="text-center">
                {c.fecha_inicio?.split('T')[0] || '-'}
              </td>
              <td className="text-center">
                {c.fecha_fin ? c.fecha_fin.split('T')[0] : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TablaContrataciones;
