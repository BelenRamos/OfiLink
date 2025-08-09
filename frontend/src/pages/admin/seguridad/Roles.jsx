import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Roles = () => {
  const [roles, setRoles] = useState([]);
  const [nuevoRol, setNuevoRol] = useState('');
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');

  const fetchRoles = async () => {
    try {
      const response = await axios.get('/api/roles');
      setRoles(response.data);
    } catch (error) {
      console.error('Error al obtener roles:', error);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleAgregarRol = async (e) => {
    e.preventDefault();
    setError('');
    setExito('');

    if (!nuevoRol.trim()) {
      setError('El nombre del rol es obligatorio');
      return;
    }

    try {
      await axios.post('/api/roles', { nombre: nuevoRol });
      setExito('Rol creado con éxito');
      setNuevoRol('');
      fetchRoles();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Error al crear el rol');
    }
  };

  return (
    <div>
      <h5>Gestión de Roles</h5>

      <form className="mb-3" onSubmit={handleAgregarRol}>
        <div className="input-group">
          <input
            type="text"
            className="form-control"
            placeholder="Nuevo rol..."
            value={nuevoRol}
            onChange={(e) => setNuevoRol(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">Agregar</button>
        </div>
        {error && <div className="text-danger mt-2">{error}</div>}
        {exito && <div className="text-success mt-2">{exito}</div>}
      </form>

      <table className="table table-bordered">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre del Rol</th>
          </tr>
        </thead>
        <tbody>
          {roles.map((rol) => (
            <tr key={rol.Id}>
              <td>{rol.Id}</td>
              <td>{rol.Nombre}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Roles;
