import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Permisos = () => {
  const [permisos, setPermisos] = useState([]);
  const [nuevoPermiso, setNuevoPermiso] = useState('');
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');

  const fetchPermisos = async () => {
    try {
      const response = await axios.get('/api/permisos');
      setPermisos(response.data);
    } catch (error) {
      console.error('Error al obtener permisos:', error);
    }
  };

  useEffect(() => {
    fetchPermisos();
  }, []);

  const handleAgregarPermiso = async (e) => {
    e.preventDefault();
    setError('');
    setExito('');

    if (!nuevoPermiso.trim()) {
      setError('El nombre del permiso es obligatorio');
      return;
    }

    try {
      await axios.post('/api/permisos', { nombre: nuevoPermiso });
      setExito('Permiso creado con éxito');
      setNuevoPermiso('');
      fetchPermisos();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Error al crear el permiso');
    }
  };

  return (
    <div>
      <h5>Gestión de Permisos</h5>

      <form className="mb-3" onSubmit={handleAgregarPermiso}>
        <div className="input-group">
          <input
            type="text"
            className="form-control"
            placeholder="Nuevo permiso..."
            value={nuevoPermiso}
            onChange={(e) => setNuevoPermiso(e.target.value)}
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
            <th>Nombre del Permiso</th>
          </tr>
        </thead>
        <tbody>
          {permisos.map((permiso) => (
            <tr key={permiso.Id}>
              <td>{permiso.Id}</td>
              <td>{permiso.Nombre}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Permisos;
