import React from 'react';

const FiltroTrabajadores = ({ oficio, setOficio, zona, setZona }) => {
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
        <option value="Zona Oeste">Zona Oeste</option>
      </select>
    </div>
  );
};

export default FiltroTrabajadores;
