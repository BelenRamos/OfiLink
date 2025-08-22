import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../utils/apiFetch';

const MiPerfil = () => {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [perfilTrabajador, setPerfilTrabajador] = useState(null);
  const [contrataciones, setContrataciones] = useState([]);

  useEffect(() => {
    const cargarDatos = async () => {
      const usuarioGuardado = localStorage.getItem('usuarioActual');
      if (!usuarioGuardado) {
        navigate('/login');
        return;
      }

      const parsedUsuario = JSON.parse(usuarioGuardado);
      setUsuario(parsedUsuario);

      try {
        // Perfil trabajador
        if (parsedUsuario.roles_keys?.includes('trabajador')) {
          const dataTrabajador = await apiFetch(`/api/trabajadores/${parsedUsuario.id}`);
          setPerfilTrabajador(dataTrabajador);
        }

        // Contrataciones cliente
        if (parsedUsuario.roles_keys?.includes('cliente')) {
          const dataContrataciones = await apiFetch('/api/contrataciones');
          setContrataciones(dataContrataciones);
        }
      } catch (err) {
        console.error('Error cargando datos:', err);
      }
    };

    cargarDatos();
  }, [navigate]);

  if (!usuario) return null;

  return (
    <div className="container mt-4">
      <h2>Mi Perfil</h2>
      <hr />
      <p><strong>Nombre:</strong> {usuario.nombre}</p>
      <p><strong>Email:</strong> {usuario.mail}</p>
      <p><strong>Rol:</strong> {usuario.roles_keys?.join(', ')}</p>

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
          {contrataciones.length === 0 ? (
            <p>No hay contrataciones.</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Trabajador</th>
                  <th>Estado</th>
                  <th>Inicio</th>
                  <th>Fin</th>
                </tr>
              </thead>
              <tbody>
                {contrataciones.map(c => (
                  <tr key={c.id}>
                    <td>{c.id}</td>
                    <td>{c.trabajador}</td>
                    <td>{c.estado}</td>
                    <td>{c.fecha_inicio}</td>
                    <td>{c.fecha_fin || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
};

export default MiPerfil;
