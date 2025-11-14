import React from 'react';

/**
 * Componente de presentación para mostrar la tabla de resultados del reporte de usuarios.
 */
const TablaReporte = ({ datos, loading, error, printRef }) => {
  if (loading || error) {
    return null;
  }

  return (
    <div ref={printRef} className="mt-4">
      {datos.length === 0 ? (
        <div className="alert alert-warning text-center">
          No se encontraron datos para el filtro seleccionado.
        </div>
      ) : (
        <div className="table-responsive shadow-sm rounded-3">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light text-center">
              <tr>
                <th style={{ width: '10%' }}>ID</th>
                <th>Nombre</th>
                <th style={{ width: '30%' }}>Rol</th>
              </tr>
            </thead>
            <tbody>
              {datos.map((d) => (
                <tr key={d.id}>
                  <td className="fw-semibold text-center">{d.id}</td>
                  <td>{d.nombre}</td>
                  <td className="text-center">
                    <span
                      className="badge rounded-pill text-dark"
                      style={{
                        backgroundColor: 'rgb(205, 148, 193)',
                        fontWeight: '500',
                      }}
                    >
                      {d.rol}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TablaReporte;
