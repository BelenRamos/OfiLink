import React from 'react';

/**
 * Componente que muestra el ícono de ordenamiento.
 */
const SortIcon = ({ direccion }) => {
  if (direccion === 'asc') return ' 🔼';
  if (direccion === 'desc') return ' 🔽';
  return ' ↕️';
};

/**
 * Componente de presentación para la tabla de denuncias (estilo mejorado).
 */
const TablaDenuncias = ({
  denunciasManejadas,
  totalDenuncias,
  ordenamiento,
  handleSort,
  abrirModalDetalle,
  error,
}) => {
  if (denunciasManejadas.length === 0) {
    if (totalDenuncias > 0) {
      return (
        <div className="alert alert-info mt-3 text-center shadow-sm rounded-3">
          No se encontraron denuncias que coincidan con los filtros aplicados.
        </div>
      );
    }
    if (!error) {
      return (
        <div className="alert alert-secondary mt-3 text-center shadow-sm rounded-3">
          No hay denuncias registradas.
        </div>
      );
    }
  }

  return (
    <div className="mt-4">
      <p className="small text-muted mb-2">
        Mostrando <strong>{denunciasManejadas.length}</strong> de{' '}
        <strong>{totalDenuncias}</strong> denuncias.
      </p>

      <div className="table-responsive shadow-sm rounded-3">
        <table className="table table-hover align-middle mb-0">
          <thead className="table-light text-center">
            <tr>
              <th
                onClick={() => handleSort('id')}
                style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}
                title="Ordenar por ID"
              >
                ID{' '}
                <SortIcon
                  direccion={
                    ordenamiento.columna === 'id'
                      ? ordenamiento.direccion
                      : ''
                  }
                />
              </th>
              <th>Cliente</th>
              <th>Trabajador</th>
              <th>Motivo</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {denunciasManejadas.map((d) => (
              <tr
                key={d.id}
                onClick={() => abrirModalDetalle(d)}
                className="table-row-hover"
                style={{ cursor: 'pointer' }}
                title="Ver detalle de denuncia"
              >
                <td className="fw-semibold text-center">{d.id}</td>
                <td className="text-start">{d.nombre_cliente}</td>
                <td className="text-start">{d.nombre_trabajador}</td>
                <td className="text-start text-muted">
                  {d.motivo.length > 70
                    ? d.motivo.substring(0, 70) + '...'
                    : d.motivo}
                </td>
                <td className="text-center">
                  {new Date(d.fecha).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TablaDenuncias;
