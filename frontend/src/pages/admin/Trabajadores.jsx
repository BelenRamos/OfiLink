/* import React, { useEffect, useState } from 'react';

const Trabajadores = () => {
  const [trabajadores, setTrabajadores] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/trabajadores')
      .then(res => {
        if (!res.ok) throw new Error('Error al obtener los trabajadores');
        return res.json();
      })
      .then(data => {
        setTrabajadores(data);
        setCargando(false);
      })
      .catch(err => {
        setError(err.message);
        setCargando(false);
      });
  }, []);

  if (cargando) return <p className="m-4">Cargando trabajadores...</p>;
  if (error) return <p className="m-4 text-danger">Error: {error}</p>;

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Lista de Trabajadores</h2>
      <table className="table table-bordered table-hover">
        <thead className="table-light">
          <tr>
            <th>Nombre</th>
            <th>Teléfono</th>
            <th>Zona</th>
            <th>Oficios</th>
            <th>Disponibilidad</th>
          </tr>
        </thead>
        <tbody>
          {trabajadores.map(t => (
            <tr key={t.id}>
              <td>{t.nombre}</td>
              <td>{t.telefono}</td>
              <td>{t.zona}</td>
              <td>{t.oficios.join(', ')}</td>
              <td>{t.estado_disponibilidad}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Trabajadores;
 */