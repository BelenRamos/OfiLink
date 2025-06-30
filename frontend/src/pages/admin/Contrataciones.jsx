import React, { useState } from 'react';

const contratacionesMock = [
  { id: 1, cliente: 'Laura G.', trabajador: 'Pedro D.', oficio: 'Electricista', estado: 'aceptada', fecha: '2025-05-01' },
  { id: 2, cliente: 'Carlos R.', trabajador: 'Marta C.', oficio: 'Plomera', estado: 'en curso', fecha: '2025-05-10' },
  { id: 3, cliente: 'Lucía B.', trabajador: 'Luciano T.', oficio: 'Carpintero', estado: 'terminada', fecha: '2025-04-15' },
];

const Contrataciones = () => {
  const [filtroEstado, setFiltroEstado] = useState('');

  const filtradas = filtroEstado
    ? contratacionesMock.filter(c => c.estado === filtroEstado)
    : contratacionesMock;

  return (
    <div>
      <h3>Contrataciones</h3>
      <div className="mb-3 d-flex gap-3 align-items-center">
        <label>Filtrar por estado:</label>
        <select
          className="form-select w-auto"
          value={filtroEstado}
          onChange={e => setFiltroEstado(e.target.value)}
        >
          <option value="">Todas</option>
          <option value="aceptada">Aceptada</option>
          <option value="en curso">En curso</option>
          <option value="terminada">Terminada</option>
        </select>
      </div>

      <table className="table table-bordered table-striped">
        <thead>
          <tr>
            <th>ID</th>
            <th>Cliente</th>
            <th>Trabajador</th>
            <th>Oficio</th>
            <th>Estado</th>
            <th>Fecha</th>
          </tr>
        </thead>
        <tbody>
          {filtradas.map(c => (
            <tr key={c.id}>
              <td>{c.id}</td>
              <td>{c.cliente}</td>
              <td>{c.trabajador}</td>
              <td>{c.oficio}</td>
              <td>{c.estado}</td>
              <td>{c.fecha}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Contrataciones;

