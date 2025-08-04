import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const MiPerfil = () => {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const usuarioGuardado = localStorage.getItem('usuarioActual');
    if (!usuarioGuardado) {
      navigate('/login');
    } else {
      setUsuario(JSON.parse(usuarioGuardado));
    }
  }, [navigate]);

  if (!usuario) return null;

  return (
    <div className="container mt-4">
      <h2>Mi Perfil</h2>
      <hr />
      <p><strong>Nombre:</strong> {usuario.nombre}</p>
      <p><strong>Email:</strong> {usuario.mail}</p>
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

      {/* Botón de cierre de sesión */}
      <div className="mt-4">
        <button
          className="btn btn-outline-secondary"
          onClick={() => {
            localStorage.removeItem('usuarioActual');
            navigate('/login');
          }}
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
};

export default MiPerfil;
