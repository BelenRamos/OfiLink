import React, { useEffect, useState } from 'react';
import { apiFetch } from '../utils/apiFetch';
import CardContratacion from '../components/CardContrataciones';
import ResenaModal from '../components/ResenaModal';

const Home = () => {
  const [usuario, setUsuario] = useState(null);
  const [contrataciones, setContrataciones] = useState([]);
  const [contratacionSeleccionada, setContratacionSeleccionada] = useState(null);

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

  // Función para cerrar el modal
  const handleCloseModal = () => {
    setContratacionSeleccionada(null);
  };
  
  // Condición para mostrar el modal
  const showModal = !!contratacionSeleccionada;

  if (!usuario) return <h2 className="mt-4">Debe iniciar sesión</h2>;

  return (
    <div className="container mt-4">
      <h2>Bienvenido, {usuario.nombre}</h2>
      {contrataciones.length === 0 && <p>No hay contrataciones aún.</p>}
      {contrataciones.map(c => (
        <CardContratacion
          key={c.id}
          contratacion={c}
          usuario={usuario}
          onActualizar={cargarContrataciones}
          onResenaPendiente={() => setContratacionSeleccionada(c)}
        />
      ))}

      {/* Modal reseña */}
      <ResenaModal
        show={showModal}
        onHide={handleCloseModal}
        contratacionId={contratacionSeleccionada?.id}
        trabajadorId={contratacionSeleccionada?.trabajador_id}
        onResenaCreada={cargarContrataciones} // Esta línea es la clave para la recarga
      />
    </div>
  );
};

export default Home;