import React from 'react';
import { apiFetch } from '../utils/apiFetch'; 

const DetallesTrabajador = ({ perfilTrabajador, setPerfilTrabajador }) => {
  if (!perfilTrabajador) {
    return null;
  }

  const handleDisponibilidadChange = async (e) => {
    const nuevoEstado = e.target.checked;
    try {
      await apiFetch(`/api/trabajadores/${perfilTrabajador.id}/disponibilidad`, {
        method: 'PUT',
        body: JSON.stringify({ disponible: nuevoEstado })
      });
      setPerfilTrabajador({ ...perfilTrabajador, disponible: nuevoEstado });
    } catch (err) {
      console.error('Error al cambiar disponibilidad', err);
    }
  };

  return (
    <>
      {/* Información del Perfil Trabajador */}
      <p><strong>Oficios:</strong> {perfilTrabajador.oficios?.join(', ') || 'No especificados'} </p>
      <p><strong>Zonas:</strong> {perfilTrabajador.zonas?.join(', ') || 'No especificadas'}</p>
      <p><strong>Descripción:</strong> {perfilTrabajador.descripcion || '(a completar)'}</p>
      <p><strong>Puntuación:</strong> {perfilTrabajador.calificacion_promedio ?? '(sin calificación)'}</p>
      
      {/* Switch de Disponibilidad */}
      <div className="form-check form-switch mt-3">
        <input
          className="form-check-input"
          type="checkbox"
          id="switchDisponibilidad"
          checked={perfilTrabajador.disponible}
          onChange={handleDisponibilidadChange}
        />
        <label className="form-check-label" htmlFor="switchDisponibilidad">
          {perfilTrabajador.disponible ? 'Disponible' : 'No disponible'}
        </label>
      </div>
    </>
  );
};

export default DetallesTrabajador;