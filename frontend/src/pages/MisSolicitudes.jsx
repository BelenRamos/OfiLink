import React, { useEffect, useState, useCallback  } from "react";
import { apiFetch } from "../utils/apiFetch";
import CardSolicitudes from "../components/CardSolicitudes";
import { useAuth } from "../hooks/useAuth";
import SolicitudModal from "../components/SolicitudModal";

const MisSolicitudes = () => {
  const { usuario, isLoading, tienePermiso, tieneRol } = useAuth(); 
  const [solicitudes, setSolicitudes] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false); 
  const [mensaje, setMensaje] = useState(''); 
  const PERMISO_VER_VISTA = 'ver_mis_solicitudes';
  const PERMISO_CANCELAR = 'cancelar_solicitud';

// Función auxiliar para el manejo detallado de errores 
const extractErrorMessage = (error, defaultMessage) => {
    const errorBody = error.response || {};
    const errorMessage = errorBody.error || defaultMessage;
    return errorMessage + (errorBody.details ? ` (${errorBody.details})` : '');
};

const cargarSolicitudes = useCallback(async () => {
    
    if (!tienePermiso(PERMISO_VER_VISTA)) return; // Detener la carga si el usuario no tiene el permiso de vista

    setMensaje(''); 
        try {
          const data = await apiFetch("/api/solicitudes/cliente"); 
          setSolicitudes(data);
    setMensaje(''); 
        } catch (error) {
        const defaultMessage = "Error al cargar solicitudes. Verifica tu conexión o sesión.";
        const fullMessage = extractErrorMessage(error, defaultMessage);

          console.error("Error al cargar solicitudes:", error);
          setMensaje(fullMessage); 
    }
}, [tienePermiso]);

useEffect(() => {
    if (usuario && usuario.roles_keys.includes("cliente")) {
      cargarSolicitudes();
    }
  }, [usuario, cargarSolicitudes, tienePermiso, tieneRol]);

if (isLoading) return <p className="mt-4">Cargando usuario...</p>;

if (!tienePermiso(PERMISO_VER_VISTA)) {
    return <h2 className="mt-4">No tienes permiso para acceder a "Mis Solicitudes".</h2>;
  }

const permisosTarjeta = {
    puedeCancelar: tienePermiso(PERMISO_CANCELAR),
    puedeTomar: false, //Se pasa por coherencoa, el permiso es olo de Trabajadores
  };

const puedePublicar = tieneRol('cliente');

return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Mis Solicitudes</h2>
        {puedePublicar && (
          <button
            className="btn btn-primary"
            onClick={() => setMostrarModal(true)}
          >
            Publicar Solicitud
          </button>
        )}
      </div>

      {mensaje && <div className="alert alert-info">{mensaje}</div>}
      
      {solicitudes.length === 0 && !mensaje && <p>No tienes solicitudes aún. ¡Publica la primera!</p>}

      <div className="solicitudes-list">
        {solicitudes.map((s) => (
          <CardSolicitudes 
            key={s.id}
            solicitud={s}
            usuario={usuario}
            onActualizar={cargarSolicitudes}
            permisos={permisosTarjeta} 
          />
        ))}
      </div>
      
      {puedePublicar && (
        <SolicitudModal
          show={mostrarModal}
          onClose={() => setMostrarModal(false)}
          onSolicitudCreada={cargarSolicitudes} 
        />
      )}
    </div>
  );
};

export default MisSolicitudes;