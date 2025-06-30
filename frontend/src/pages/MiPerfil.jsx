import React from 'react';
import usuario from '../data/usuarioActual.json';

const MiPerfil = () => {
  return (
    <div className="container mt-4">
      <h2>Mi Perfil</h2>
      <hr />
      <p><strong>Nombre:</strong> {usuario.nombre}</p>
      <p><strong>Email:</strong> {usuario.email}</p>
      <p><strong>Teléfono:</strong> {usuario.telefono}</p>
      <p><strong>Rol:</strong> {usuario.tipo === 'trabajador' ? 'Trabajador' : 'Cliente'}</p>

      {usuario.tipo === 'trabajador' && (
        <>
          <p><strong>Oficio:</strong> {usuario.oficio}</p>
          <p><strong>Zona:</strong> {usuario.zona}</p>
          <p><strong>Descripción:</strong> {usuario.descripcion}</p>
          {/* A futuro: mostrar reseñas, historial, etc. */}
        </>
      )}

      {usuario.tipo === 'cliente' && (
        <>
          <h5 className="mt-4">Contrataciones</h5>
          <p>(A futuro se mostrarán aquí los trabajos solicitados)</p>
        </>
      )}
    </div>
  );
};

export default MiPerfil;
