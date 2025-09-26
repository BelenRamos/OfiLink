import React, { useEffect, useState } from 'react';
import { apiFetch } from '../utils/apiFetch';
import CardContratacion from '../components/CardContrataciones';
import ResenaModal from '../components/ResenaModal';
import { useAuth } from '../hooks/useAuth';

const MisContrataciones = () => {
  //const [usuario, setUsuario] = useState(null);
  const { usuario, tienePermiso, isLoading } = useAuth();
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

  const handleCloseModal = () => { 
    setContratacionSeleccionada(null);
  };
  

/*   useEffect(() => {
    const usuarioGuardado = localStorage.getItem('usuarioActual');
    if (!usuarioGuardado) return;

    const parsedUsuario = JSON.parse(usuarioGuardado);
    setUsuario(parsedUsuario);

    cargarContrataciones();
  }, []); */
 
  useEffect(() => {
        if (usuario) {
            cargarContrataciones();
        }
  }, [usuario]);

  
  const showModal = !!contratacionSeleccionada;

console.log("DEBUG RENDER: Usuario existe:", !!usuario);
console.log("DEBUG RENDER: Valor de tienePermiso('contratacion_terminar'):", tienePermiso('contratacion_terminar'));

if (isLoading) return <p>Cargando usuario...</p>;


const permisosTarjeta = {
    aceptar: !!tienePermiso('contratacion_aceptar'),
    cancelar: !!tienePermiso('contratacion_cancelar'),
    resenar: !!tienePermiso('contratacion_resenar'),
    terminar: !!tienePermiso('contratacion_terminar'),
};


if (!usuario || !tienePermiso("ver_mis_contrataciones")) {
      return <h2 className="mt-4">No tienes permiso para ver Mis Contrataciones</h2>;
}

/*   if (!usuario || !tienePermiso("ver_mis_contrataciones")) {
      return <h2 className="mt-4">No tienes permiso para ver Mis Contrataciones</h2>;
  } */
  

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
          permisos={permisosTarjeta} 
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
