import React from 'react';
import { useNavigate } from 'react-router-dom';

const MiPerfil = () => {
  const navigate = useNavigate();

  const usuario = JSON.parse(localStorage.getItem('usuarioActual'));

  // Si no hay usuario logueado, redirigimos al login
  if (!usuario) {
    navigate('/login');
    return null;
  }

  return (
    <div className="container mt-4">
      <h2>Mi Perfil</h2>
      <hr />
      <p><strong>Nombre:</strong> {usuario.Nombre}</p>
      <p><strong>Email:</strong> {usuario.Email}</p>
      <p><strong>Teléfono:</strong> {usuario.Telefono}</p>
      <p><strong>Rol:</strong> {usuario.tipo === 'trabajador' ? 'Trabajador' : 'Cliente'}</p>

      {usuario.tipo === 'trabajador' && (
        <>
          <p><strong>Oficio:</strong> {usuario.oficio ?? '(a completar)'}</p>
          <p><strong>Zona:</strong> {usuario.zona ?? '(a completar)'}</p>
          <p><strong>Descripción:</strong> {usuario.descripcion ?? '(a completar)'}</p>
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
