import React, { useState } from 'react';

// Datos mock
const usuariosMock = [
  { id: 1, nombre: 'Laura G.', email: 'laura@gmail.com', telefono: '1199990000', tipo: 'cliente' },
  { id: 2, nombre: 'Pedro Díaz', email: 'pedro@trabajo.com', telefono: '1122233344', tipo: 'trabajador' },
  { id: 3, nombre: 'Marta C.', email: 'marta@live.com', telefono: '1177788899', tipo: 'cliente' },
  { id: 4, nombre: 'Luciano Tech', email: 'luci.tech@gmail.com', telefono: '1144455566', tipo: 'trabajador' },
];

const Usuarios = () => {
  const [filtroTipo, setFiltroTipo] = useState('');

  const usuariosFiltrados = filtroTipo
    ? usuariosMock.filter(u => u.tipo === filtroTipo)
    : usuariosMock;

  return (
    <div className="container mt-4">
      <h2>Gestión de Usuarios</h2>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <label className="form-label">Filtrar por tipo:</label>
        <select
          className="form-select w-auto"
          value={filtroTipo}
          onChange={e => setFiltroTipo(e.target.value)}
        >
          <option value="">Todos</option>
          <option value="cliente">Clientes</option>
          <option value="trabajador">Trabajadores</option>
        </select>
      </div>

      <table className="table table-bordered table-striped">
        <thead className="table-light">
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Email</th>
            <th>Teléfono</th>
            <th>Tipo</th>
          </tr>
        </thead>
        <tbody>
          {usuariosFiltrados.map(usuario => (
            <tr key={usuario.id}>
              <td>{usuario.id}</td>
              <td>{usuario.nombre}</td>
              <td>{usuario.email}</td>
              <td>{usuario.telefono}</td>
              <td>{usuario.tipo}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Usuarios;
