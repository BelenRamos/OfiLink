import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Grupos = () => {
  const [grupos, setGrupos] = useState([]);
  const [nuevoGrupo, setNuevoGrupo] = useState('');
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');

  const fetchGrupos = async () => {
    try {
      const response = await axios.get('/api/grupos');
      setGrupos(response.data);
    } catch (error) {
      console.error('Error al obtener grupos:', error);
    }
  };

  useEffect(() => {
    fetchGrupos();
  }, []);

  const handleAgregarGrupo = async (e) => {
    e.preventDefault();
    setError('');
    setExito('');

    if (!nuevoGrupo.trim()) {
      setError('El nombre del grupo es obligatorio');
      return;
    }

    try {
      await axios.post('/api/grupos', { nombre: nuevoGrupo });
      setExito('Grupo creado con éxito');
      setNuevoGrupo('');
      fetchGrupos();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Error al crear el grupo');
    }
  };

  return (
    <div>
      <h5>Gestión de Grupos</h5>

      <form className="mb-3" onSubmit={handleAgregarGrupo}>
        <div className="input-group">
          <input
            type="text"
            className="form-control"
            placeholder="Nuevo grupo..."
            value={nuevoGrupo}
            onChange={(e) => setNuevoGrupo(e.target.value)}
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
            <th>Nombre del Grupo</th>
          </tr>
        </thead>
        <tbody>
          {grupos.map((grupo) => (
            <tr key={grupo.Id}>
              <td>{grupo.Id}</td>
              <td>{grupo.Nombre}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Grupos;
