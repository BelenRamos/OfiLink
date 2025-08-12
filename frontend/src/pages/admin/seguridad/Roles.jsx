import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaChevronRight, FaChevronDown } from 'react-icons/fa';

const Roles = () => {
  const [roles, setRoles] = useState([]);
  const [nuevoRol, setNuevoRol] = useState('');
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [rolesConPermisos, setRolesConPermisos] = useState([]);
  const [expanded, setExpanded] = useState({}); // control de expandir/contraer

  const fetchRoles = async () => {
    try {
      const response = await axios.get('/api/roles');
      setRoles(response.data);
    } catch (error) {
      console.error('Error al obtener roles:', error);
    }
  };

  const fetchRolesPermisos = async () => {
    try {
      const { data } = await axios.get('/api/roles/con-permisos');
      const agrupado = data.reduce((acc, item) => {
        if (!acc[item.RolId]) {
          acc[item.RolId] = { rol: item.RolNombre, permisos: [] };
        }
        acc[item.RolId].permisos.push(item);
        return acc;
      }, {});
      setRolesConPermisos(Object.values(agrupado));
    } catch (error) {
      console.error('Error al obtener roles con permisos:', error);
    }
  };

  useEffect(() => {
    fetchRoles();
    fetchRolesPermisos();
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

  const toggleExpand = (permisoId) => {
    setExpanded((prev) => ({
      ...prev,
      [permisoId]: !prev[permisoId]
    }));
  };

  const renderPermiso = (permiso, todos) => {
    const hijos = todos.filter(p => p.PadreId === permiso.PermisoId);
    const isExpanded = expanded[permiso.PermisoId] || false;

    return (
      <li key={permiso.PermisoId} style={{ marginLeft: '10px', listStyle: 'none' }}>
        {hijos.length > 0 && (
          <span onClick={() => toggleExpand(permiso.PermisoId)} style={{ cursor: 'pointer', marginRight: '5px' }}>
            {isExpanded ? <FaChevronDown /> : <FaChevronRight />}
          </span>
        )}
        {permiso.PermisoNombre}
        {hijos.length > 0 && isExpanded && (
          <ul style={{ paddingLeft: '20px' }}>
            {hijos.map(hijo => renderPermiso(hijo, todos))}
          </ul>
        )}
      </li>
    );
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

      <h5 className="mt-4">Roles y Permisos (Árbol colapsable)</h5>
      {rolesConPermisos.map((rol, idx) => {
        const permisosRaiz = rol.permisos.filter(p => p.PadreId === null);
        return (
          <div key={idx} style={{ marginBottom: '20px' }}>
            <strong>{rol.rol}</strong>
            <ul style={{ paddingLeft: '10px' }}>
              {permisosRaiz.map(p => renderPermiso(p, rol.permisos))}
            </ul>
          </div>
        );
      })}
    </div>
  );
};

export default Roles;
