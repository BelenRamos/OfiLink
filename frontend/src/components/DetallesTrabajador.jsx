import React from 'react';
import { apiFetch } from '../utils/apiFetch'; // Asegúrate de importar esto

const DetallesTrabajador = ({ perfilTrabajador, setPerfilTrabajador }) => {
  if (!perfilTrabajador) {
    return null;
  }

  const handleDisponibilidadChange = async (e) => {
    const nuevoEstado = e.target.checked;
    try {
      // Petición PUT a la API para actualizar la disponibilidad
      await apiFetch(`/api/trabajadores/${perfilTrabajador.id}/disponibilidad`, {
        method: 'PUT',
        body: JSON.stringify({ disponible: nuevoEstado })
      });
      // Actualizar el estado local si la API responde correctamente
      setPerfilTrabajador({ ...perfilTrabajador, disponible: nuevoEstado });
    } catch (err) {
      console.error('Error al cambiar disponibilidad', err);
      // Opcional: Revertir el estado del switch si hay error
    }
  };

  return (
    <>
      {/* Información del Perfil Trabajador */}
      <p><strong>Oficios:</strong> {perfilTrabajador.oficios.join(', ') || '(a completar)'}</p>
      <p><strong>Zonas:</strong> {perfilTrabajador.zonas.join(', ') || '(a completar)'}</p>
      <p><strong>Descripción:</strong> {perfilTrabajador.descripcion || '(a completar)'}</p>
      <p><strong>Teléfono:</strong> {perfilTrabajador.telefono || '(a completar)'}</p>
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