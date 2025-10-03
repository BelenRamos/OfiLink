import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../utils/apiFetch';
import FotoPerfil from '../components/FotoPerfil'; 

const MiPerfil = () => {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [perfilTrabajador, setPerfilTrabajador] = useState(null);
  const [contrataciones, setContrataciones] = useState([]);

  const handleFotoUpdate = (nuevaUrl) => {
    // 1. Actualizar el estado del usuario principal (donde se guarda la URL de la foto)
    setUsuario(prevUsuario => {
      const nuevoUsuario = { ...prevUsuario, foto_url: nuevaUrl };
      // Opcional: Actualizar también en localStorage si lo usas para la sesión
      localStorage.setItem('usuarioActual', JSON.stringify(nuevoUsuario));
      return nuevoUsuario;
    });
    
    // 2. Si el usuario es trabajador, también actualizamos el estado específico del perfil
    if (perfilTrabajador) {
      setPerfilTrabajador(prevPerfil => ({
        ...prevPerfil,
        foto_url: nuevaUrl
      }));
    }
  };

  useEffect(() => {
    const cargarDatos = async () => {
      const usuarioGuardado = localStorage.getItem('usuarioActual');
      if (!usuarioGuardado) {
        navigate('/login');
        return;
      }

      const parsedUsuario = JSON.parse(usuarioGuardado);
      // NO usamos setUsuario(parsedUsuario) inmediatamente, cargaremos datos frescos

      try {
        // 💡 CAMBIO CLAVE: Cargar datos completos y frescos del usuario, incluyendo foto
        const dataPersona = await apiFetch(`/api/personas/${parsedUsuario.id}`);

        // Combinamos los datos del perfil (incluyendo foto_url) con los roles guardados
        // para tener un objeto de usuario completo y actualizado.
        const usuarioActualizado = {
            ...parsedUsuario, // Mantenemos token, etc.
            ...dataPersona, // Sobrescribimos nombre, mail, foto_url, etc.
            roles_keys: parsedUsuario.roles_keys // Aseguramos que los roles sigan presentes
        };

        setUsuario(usuarioActualizado);


        // Perfil trabajador (solo si aplica)
        if (usuarioActualizado.roles_keys?.includes('trabajador')) {
          const dataTrabajador = await apiFetch(`/api/trabajadores/${usuarioActualizado.id}`);
          setPerfilTrabajador(dataTrabajador); 
        }

        // Contrataciones cliente (solo si aplica)
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
      <FotoPerfil
        userId={usuario.id}
        currentFotoUrl={usuario.foto_url} 
        onFotoUpdate={handleFotoUpdate}
      />

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
          
          <div className="form-check form-switch mt-3">
            <input
              className="form-check-input"
              type="checkbox"
              id="switchDisponibilidad"
              checked={perfilTrabajador.disponible}
              onChange={async (e) => {
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
              }}
            />
            <label className="form-check-label" htmlFor="switchDisponibilidad">
              {perfilTrabajador.disponible ? 'Disponible' : 'No disponible'}
            </label>
          </div>
        </>
      )}

      {usuario.roles_keys?.includes('cliente') && (
        <>
          <h5 className="mt-4">Contrataciones</h5> {/* Esto hacerlo componente aparte */}
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