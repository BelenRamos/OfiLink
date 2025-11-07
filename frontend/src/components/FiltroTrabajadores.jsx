import React from 'react';

const FiltroTrabajadores = ({ oficio, setOficio, zona, setZona, calificacion, setCalificacion }) => {
  return (
    <div className="mb-4 d-flex gap-3 flex-wrap">
      <input
        type="text"
        placeholder="Filtrar por oficio..."
        className="form-control"
        value={oficio}
        onChange={e => setOficio(e.target.value)}
        style={{ minWidth: '200px' }}
      />

      <select
        className="form-select"
        value={zona}
        onChange={e => setZona(e.target.value)}
        style={{ minWidth: '150px' }}
      >
        <option value="">Todas las zonas</option>
        <option value="Zona Norte">Zona Norte</option>
        <option value="Zona Sur">Zona Sur</option>
        <option value="Zona Centro">Zona Centro</option>
        <option value="Zona Este">Zona Este</option>
        <option value="Zona Oeste">Zona Oeste</option>
      </select>
      
      <select
        className="form-select"
        value={calificacion}
        onChange={e => setCalificacion(e.target.value)}
        style={{ minWidth: '180px' }}
      >
        <option value="">Cualquier calificación</option>
        <option value="5">⭐⭐⭐⭐⭐ (5 estrellas)</option>
        <option value="4">⭐⭐⭐⭐ (4 estrellas o más)</option>
        <option value="3">⭐⭐⭐ (3 estrellas o más)</option>
      </select>
    </div>
  );
};

export default FiltroTrabajadores;