import React, { useState } from 'react';
import { apiFetch } from '../utils/apiFetch';

const CardContratacion = ({ contratacion, usuario, onActualizar, onResenaPendiente }) => {
  const [estadoActual, setEstadoActual] = useState(contratacion.estado);

  const handleAccion = async (accion) => {
    try {
      const url = `/api/contrataciones/${contratacion.id}/${accion}`;
      await apiFetch(url, { method: 'PUT' });

      let nuevoEstado = '';
      if (accion === 'aceptar') nuevoEstado = 'Aceptada';
      if (accion === 'terminar') nuevoEstado = 'Finalizada';
      if (accion === 'cancelar') nuevoEstado = 'Cancelada';
      setEstadoActual(nuevoEstado);

      onActualizar && onActualizar();
    } catch (error) {
      alert(`Error al realizar la acción: ${error.message}`);
    }
  };

  const esTrabajador = usuario.roles_keys.includes('trabajador');
  const esCliente = usuario.roles_keys.includes('cliente');

  const puedeAceptar = esTrabajador && estadoActual === 'Pendiente';
  const puedeTerminar = esTrabajador && estadoActual === 'En curso';
  const puedeCancelar =
    (esTrabajador || esCliente) &&
    estadoActual !== 'Finalizada' &&
    estadoActual !== 'Cancelada';

  // Para la reseña
  const puedeResenar =
    esCliente &&
    estadoActual === 'Finalizada' &&
    !contratacion.reseña_id; 

  const reseñaYaHecha = esCliente && estadoActual === 'Finalizada' && contratacion.reseña_id;


  return (
    <div className="card mb-3">
      <div className="card-body">
        <h5 className="card-title">
          {contratacion.trabajador || 'Trabajador no asignado'}
        </h5>
        <p><strong>Cliente:</strong> {contratacion.cliente || 'N/A'}</p>
        <p><strong>Descripción:</strong> {contratacion.descripcion_trabajo || '(sin descripción)'}</p>
        <p><strong>Fecha inicio:</strong> {contratacion.fecha_inicio}</p>
        <p><strong>Estado:</strong> {estadoActual}</p>

        <div className="mt-2">
          {puedeAceptar && (
            <button
              className="btn btn-success me-2"
              onClick={() => handleAccion('aceptar')}
            >
              Aceptar
            </button>
          )}

          {puedeTerminar && (
            <button
              className="btn btn-primary me-2"
              onClick={() => handleAccion('terminar')}
            >
              Terminar
            </button>
          )}

          {puedeCancelar && (
            <button
              className="btn btn-danger me-2"
              onClick={() => handleAccion('cancelar')}
            >
              Cancelar
            </button>
          )}

          {puedeResenar && (
            <button
              className="btn btn-warning"
              onClick={() => onResenaPendiente(contratacion)}
            >
              Dejar reseña
            </button>
          )}
          
          {reseñaYaHecha && (
            <button className="btn btn-success" disabled>
              Finalizada
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CardContratacion;
