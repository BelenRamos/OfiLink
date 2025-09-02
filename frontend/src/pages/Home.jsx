import React, { useEffect, useState } from 'react';
import { apiFetch } from '../utils/apiFetch';
import CardContratacion from '../components/CardContrataciones';

const Home = () => {
  const [usuario, setUsuario] = useState(null);
  const [contrataciones, setContrataciones] = useState([]);

  const cargarContrataciones = async () => {
    try {
      const data = await apiFetch('/api/contrataciones');
      setContrataciones(data);
    } catch (error) {
      console.error(error);
      alert('Error al cargar contrataciones');
    }
  };

  useEffect(() => {
    const usuarioGuardado = localStorage.getItem('usuarioActual');
    if (!usuarioGuardado) return;

    const parsedUsuario = JSON.parse(usuarioGuardado);
    setUsuario(parsedUsuario);

    cargarContrataciones();
  }, []);

  if (!usuario) return <h2 className="mt-4">Debe iniciar sesión</h2>;

  // Helpers para roles
  const tieneRol = (...roles) => roles.some(r => usuario?.roles_keys?.includes(r));

  // Filtramos según el rol
  let contratacionesMostradas = contrataciones;
  if (tieneRol('cliente')) {
    contratacionesMostradas = contrataciones.filter(c => c.estado === 'En curso');
  }
  // Para trabajadores dejamos todo igual (no filtramos)

  return (
    <div className="container mt-4">
      <h2>Bienvenido, {usuario.nombre}</h2>

      {contratacionesMostradas.length === 0 && (
        <p>¡No tienes contrataciones en curso!</p>
        
      )}

      {contratacionesMostradas.map(c => (
        <CardContratacion
          key={c.id}
          contratacion={c}
          usuario={usuario}
          onActualizar={cargarContrataciones}
        />
      ))}
    </div>
  );
};

export default Home;
