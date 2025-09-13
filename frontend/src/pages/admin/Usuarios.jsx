import axios from 'axios';
import { useState, useEffect } from 'react';

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [filtroTipo, setFiltroTipo] = useState('');
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    const response = await axios.get('/api/personas');
    setUsuarios(response.data);
  };

  const resetearContraseña = async (id) => {
    try {
      const response = await axios.post(`/api/personas/${id}/reset-password`);
      setMensaje(`Nueva contraseña: ${response.data.nuevaPassword}`);
      fetchUsuarios(); // refrescar
    } catch (error) {
      console.error(error);
      setMensaje('Error al resetear contraseña');
    }
  };

  const usuariosFiltrados = filtroTipo
    ? usuarios.filter(u => u.tipo === filtroTipo)
    : usuarios;

  return (
    <div className="container mt-4">
      <h2>Gestión de Usuarios</h2>
      {mensaje && <div className="alert alert-info">{mensaje}</div>}

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
            <th>Tipo</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuariosFiltrados.map(usuario => (
            <tr key={usuario.id}>
              <td>{usuario.id}</td>
              <td>{usuario.nombre}</td>
              <td>{usuario.mail}</td>
              <td>{usuario.tipo}</td>
              <td>
                <button
                  className="btn btn-sm btn-warning"
                  onClick={() => resetearContraseña(usuario.id)}
                >
                  🔑 Resetear
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};


export default Usuarios;
