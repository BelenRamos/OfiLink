import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import trabajadoresMock from '../data/trabajadores.json';

// Datos simulados de reseñas
const reseñasMock = {
  1: [
    { id: 1, cliente: 'Laura M.', comentario: 'Muy profesional y puntual.', puntuacion: 5 },
    { id: 2, cliente: 'Carlos R.', comentario: 'Buen trabajo, recomendado.', puntuacion: 4 },
  ],
  2: [
    { id: 3, cliente: 'Ana G.', comentario: 'Excelente servicio.', puntuacion: 5 },
  ],
  // etc...
};

const PerfilTrabajador = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const trabajador = trabajadoresMock.find(t => t.id === parseInt(id));
  if (!trabajador) {
    return <div className="container mt-4"><p>Trabajador no encontrado.</p></div>;
  }

  const reseñas = reseñasMock[trabajador.id] || [];

  return (
    <div className="container mt-4">
      <button className="btn btn-secondary mb-3" onClick={() => navigate(-1)}>← Volver</button>

      <h2>{trabajador.nombre}</h2>
      <h5 className="text-muted">{trabajador.oficio} - {trabajador.zona}</h5>
      <p>{trabajador.descripcion}</p>
      <p><strong>Teléfono:</strong> <a href={`tel:${trabajador.telefono}`}>{trabajador.telefono}</a></p>

      <hr />

      <h4>Reseñas</h4>
      {reseñas.length === 0 && <p>No hay reseñas para este trabajador.</p>}
      <ul className="list-group">
        {reseñas.map(r => (
          <li key={r.id} className="list-group-item">
            <strong>{r.cliente}</strong>: {r.comentario} <span>⭐ {r.puntuacion}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PerfilTrabajador;
