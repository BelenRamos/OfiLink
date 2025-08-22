import React, { useState } from 'react';
import { apiFetch } from '../utils/apiFetch';

const CardContratacion = ({ contratacion, usuario, onActualizar }) => {
  // Inicialmente, usa el estado que viene de la base de datos
  const [estadoActual, setEstadoActual] = useState(contratacion.estado);

  const handleAccion = async (accion) => {
    try {
      // La URL ahora incluye la acción como parte del path
      const url = `/api/contrataciones/${contratacion.id}/${accion}`;

      await apiFetch(url, {
        method: 'PUT',
        // No necesitas enviar un body, la acción ya va en la URL
        // body: { estado_descripcion: nuevoEstado } <-- Esto ya no es necesario
      });

      // Si la petición es exitosa, se actualiza el estado en el front-end
      // Esto es solo para dar una respuesta inmediata, el onActualizar recargará los datos
      let nuevoEstado = '';
      if (accion === 'aceptar') nuevoEstado = 'Aceptada'; // Cambiar a 'Aceptada'
      if (accion === 'terminar') nuevoEstado = 'Finalizada';
      if (accion === 'cancelar') nuevoEstado = 'Cancelada';
      setEstadoActual(nuevoEstado);

      // Llama a la función para recargar todas las contrataciones
      onActualizar && onActualizar();

    } catch (error) {
      alert(`Error al realizar la acción: ${error.message}`);
    }
  };

  const esTrabajador = usuario.roles_keys.includes('trabajador');
  const esCliente = usuario.roles_keys.includes('cliente');

  // Lógica para determinar si el botón 'Aceptar' debe ser visible
  const puedeAceptar = esTrabajador && estadoActual === 'Pendiente';

  // Lógica para determinar si el botón 'Terminar' debe ser visible
  // Nota: El back-end lo cambia de 'Aceptada' a 'En curso' automáticamente
  // En tu front-end, el botón 'Terminar' debe aparecer cuando el estado es 'En curso'
  const puedeTerminar = esTrabajador && estadoActual === 'En curso';

  // Lógica para determinar si el botón 'Cancelar' debe ser visible
  const puedeCancelar = (esTrabajador || esCliente) && (estadoActual !== 'Finalizada' && estadoActual !== 'Cancelada');

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
              className="btn btn-danger"
              onClick={() => handleAccion('cancelar')}
            >
              Cancelar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CardContratacion;