import React from 'react';

const ListaContratacionesCliente = ({ contrataciones }) => {
  if (contrataciones.length === 0) {
    return <p>No hay contrataciones.</p>;
  }

  return (
    <>
      <h5 className="mt-4">Contrataciones</h5>
      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Trabajador</th>
            <th>Estado</th>
            <th>Inicio</th>
            <th>Fin</th>
          </tr>
        </thead>
        <tbody>
          {contrataciones.map(c => (
            <tr key={c.id}>
              <td>{c.id}</td>
              <td>{c.trabajador}</td>
              <td>{c.estado}</td>
              <td>{c.fecha_inicio}</td>
              <td>{c.fecha_fin || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

export default ListaContratacionesCliente;