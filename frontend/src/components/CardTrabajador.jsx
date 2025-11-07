import React from 'react';
import { Link } from 'react-router-dom';

const CardTrabajador = ({ trabajador }) => {
  const renderCalificacion = (calificacion) => {
    if (calificacion === null || calificacion === undefined) return 'Sin calificación';
    const estrellasLlenas = '⭐'.repeat(Math.round(calificacion));
    const estrellasVacias = '☆'.repeat(5 - Math.round(calificacion));
    return (
      <span title={`Calificación promedio: ${calificacion.toFixed(1)}/5`}>
        {estrellasLlenas}{estrellasVacias} 
        ({calificacion.toFixed(1)})
      </span>
    );
  };

  return (
    <div className="card h-100">
      <div className="card-body d-flex flex-column">
        <h5 className="card-title">{trabajador.nombre}</h5>
        <h6 className="card-subtitle mb-2 text-muted">
          {trabajador.oficios?.join(', ')} - {trabajador.zonas?.join(', ')}
        </h6>
        
        <p className="card-text mb-2">
          Calificación: {renderCalificacion(trabajador.calificacion_promedio)}
        </p>

        <p className="card-text flex-grow-1">{trabajador.descripcion}</p>
        
        <div className="mt-auto d-flex gap-2">
          <a href={`tel:${trabajador.contacto}`} className="btn btn-primary">Contactar</a>
          <Link to={`/perfil/${trabajador.id}`} className="btn btn-outline-secondary">Ver perfil</Link>
        </div>
      </div>
    </div>
  );
};

export default CardTrabajador;