/* import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Asignaciones = () => {
  const [asignaciones, setAsignaciones] = useState([]);
  const [nuevo, setNuevo] = useState({ usuarioId: '', rolId: '' });
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');

  const fetchAsignaciones = async () => {
    try {
      const response = await axios.get('/api/asignaciones');
      setAsignaciones(response.data);
    } catch (error) {
      console.error('Error al obtener asignaciones:', error);
    }
  };

  useEffect(() => {
    fetchAsignaciones();
  }, []);

  const handleAgregarAsignacion = async (e) => {
    e.preventDefault();
    setError('');
    setExito('');

    if (!nuevo.usuarioId || !nuevo.rolId) {
      setError('Debe seleccionar usuario y rol');
      return;
    }

    try {
      await axios.post('/api/asignaciones', nuevo);
      setExito('Asignación creada con éxito');
      setNuevo({ usuarioId: '', rolId: '' });
      fetchAsignaciones();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Error al crear la asignación');
    }
  };

  return (
    <div>
      <h5>Gestión de Asignaciones</h5>

      <form className="mb-3" onSubmit={handleAgregarAsignacion}>
        <input
          type="text"
          placeholder="ID Usuario"
          value={nuevo.usuarioId}
          onChange={(e) => setNuevo({ ...nuevo, usuarioId: e.target.value })}
        />
        <input
          type="text"
          placeholder="ID Rol"
          value={nuevo.rolId}
          onChange={(e) => setNuevo({ ...nuevo, rolId: e.target.value })}
        />
        <button type="submit" className="btn btn-primary">Asignar</button>
      </form>

      {error && <div className="text-danger mt-2">{error}</div>}
      {exito && <div className="text-success mt-2">{exito}</div>}

      <table className="table table-bordered">
        <thead>
          <tr>
            <th>ID</th>
            <th>Usuario</th>
            <th>Rol</th>
          </tr>
        </thead>
        <tbody>
          {asignaciones.map((asig) => (
            <tr key={asig.Id}>
              <td>{asig.Id}</td>
              <td>{asig.UsuarioNombre}</td>
              <td>{asig.RolNombre}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Asignaciones;
 */