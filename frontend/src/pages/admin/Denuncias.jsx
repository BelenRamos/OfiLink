import React, { useEffect, useState } from 'react';

const Denuncias = () => {
  const [denuncias, setDenuncias] = useState([]);
  const [loading, setLoading] = useState(true);

  const cargarDenuncias = async () => {
    try {
      const res = await fetch('/api/denuncias');
      const data = await res.json();
      setDenuncias(data);
    } catch (error) {
      console.error('Error al obtener denuncias:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDenuncias();
  }, []);

  if (loading) return <p>Cargando denuncias...</p>;

  return (
    <div>
      <h3>Denuncias registradas</h3>
      <hr />
      {denuncias.length === 0 ? (
        <p>No hay denuncias registradas.</p>
      ) : (
        <table className="table table-striped">
          <thead>
            <tr>
              <th>ID</th>
              <th>Cliente</th>
              <th>Trabajador</th>
              <th>Motivo</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {denuncias.map((d) => (
              <tr key={d.id}>
                <td>{d.id}</td>
                <td>{d.nombre_cliente}</td>
                <td>{d.nombre_trabajador}</td>
                <td>{d.motivo}</td>
                <td>{new Date(d.fecha).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Denuncias;
