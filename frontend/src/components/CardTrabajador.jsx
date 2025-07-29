import React from 'react';
import { Link } from 'react-router-dom';

const CardTrabajador = ({ trabajador }) => {
  return (
    <div className="card h-100">
      <div className="card-body d-flex flex-column">
        <h5 className="card-title">{trabajador.nombre}</h5>
        <h6 className="card-subtitle mb-2 text-muted">
          {trabajador.oficios?.join(', ')} - {trabajador.zonas?.join(', ')}
        </h6>
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
