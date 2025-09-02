import React, { useEffect, useState } from 'react';
import { apiFetch } from '../utils/apiFetch';
import CardContratacion from '../components/CardContrataciones';
import ResenaModal from '../components/ResenaModal';

const MisContrataciones = () => {
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

  const handleCloseModal = () => {
    setContratacionSeleccionada(null);
  };

  const showModal = !!contratacionSeleccionada;

  if (!usuario) return <h2 className="mt-4">Debe iniciar sesión</h2>;

  return (
    <div className="container mt-4">
      <h2>Mis Contrataciones</h2>
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

      <ResenaModal
        show={showModal}
        onHide={handleCloseModal}
        contratacionId={contratacionSeleccionada?.id}
        trabajadorId={contratacionSeleccionada?.trabajador_id}
        onResenaCreada={cargarContrataciones}
      />
    </div>
  );
};

export default MisContrataciones;
