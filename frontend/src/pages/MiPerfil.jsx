import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const MiPerfil = () => {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [perfilTrabajador, setPerfilTrabajador] = useState(null);

  useEffect(() => {
    const usuarioGuardado = localStorage.getItem('usuarioActual');
    if (!usuarioGuardado) {
      navigate('/login');
      return;
    }
    const parsedUsuario = JSON.parse(usuarioGuardado);
    setUsuario(parsedUsuario);

    // Si es trabajador, cargar perfil detallado
    if (parsedUsuario.roles_keys?.includes('trabajador')) {
      fetch(`/api/trabajadores/${parsedUsuario.id}`)
        .then(res => res.json())
        .then(data => setPerfilTrabajador(data))
        .catch(err => console.error('Error cargando perfil trabajador:', err));
    }
  }, [navigate]);

  if (!usuario) return null;

  return (
    <div className="container mt-4">
      <h2>Mi Perfil</h2>
      <hr />
      <p><strong>Nombre:</strong> {usuario.nombre}</p>
      <p><strong>Email:</strong> {usuario.mail}</p>
      <p><strong>Rol:</strong> 
        {usuario.roles_keys?.includes('administrador')
          ? 'Administrador'
          : usuario.roles_keys?.includes('supervisor')
            ? 'Supervisor'
            : usuario.roles_keys?.includes('trabajador')
              ? 'Trabajador'
              : usuario.roles_keys?.includes('cliente')
                ? 'Cliente'
                : '(Desconocido)'}
      </p>


      {usuario.roles_keys?.includes('trabajador') && perfilTrabajador && (
        <>
          <p><strong>Oficios:</strong> {perfilTrabajador.oficios.join(', ') || '(a completar)'}</p>
          <p><strong>Zonas:</strong> {perfilTrabajador.zonas.join(', ') || '(a completar)'}</p>
          <p><strong>Descripción:</strong> {perfilTrabajador.descripcion || '(a completar)'}</p>
          <p><strong>Teléfono:</strong> {perfilTrabajador.telefono || '(a completar)'}</p>
          <p><strong>Puntuación:</strong> {perfilTrabajador.calificacion_promedio ?? '(sin calificación)'}</p>
        </>
      )}

      {usuario.roles_keys?.includes('cliente') && (
        <>
          <h5 className="mt-4">Contrataciones</h5>
          <p>(A futuro se mostrarán aquí los trabajos solicitados)</p>
        </>
      )}

      <div className="mt-4">
        <button className="nav-link btn btn-link logout-btn" onClick={() => {
          localStorage.removeItem('usuarioActual');
          setUsuario(null);
          window.location.href = '/';
        }}>
          Cerrar sesión
        </button>
      </div>
    </div>
  );
};

export default MiPerfil;
