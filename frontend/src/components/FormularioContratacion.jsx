//Ejemplo basico

import React, { useState } from 'react';

const FormularioContratacion = ({ idTrabajador, onCancel, onSuccess }) => {
  const [descripcion, setDescripcion] = useState('');
  const [fecha, setFecha] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/contrataciones', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          idTrabajador,
          descripcion,
          fecha,
          // el idCliente debe obtenerse del contexto o sesión
        }),
      });
      if (!res.ok) throw new Error('Error al crear la contratación');
      onSuccess();
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border p-3 mb-3">
      <div className="mb-3">
        <label>Descripción del trabajo</label>
        <textarea
          className="form-control"
          value={descripcion}
          onChange={e => setDescripcion(e.target.value)}
          required
        />
      </div>
      <div className="mb-3">
        <label>Fecha deseada</label>
        <input
          type="date"
          className="form-control"
          value={fecha}
          onChange={e => setFecha(e.target.value)}
        />
      </div>
      <button type="submit" className="btn btn-primary me-2">Enviar solicitud</button>
      <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancelar</button>
    </form>
  );
};

export default FormularioContratacion;
