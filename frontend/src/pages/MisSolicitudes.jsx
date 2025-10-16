import React, { useEffect, useState, useCallback  } from "react";
import { apiFetch } from "../utils/apiFetch";
import CardSolicitudes from "../components/CardSolicitudes";
import { useAuth } from "../hooks/useAuth";
import SolicitudModal from "../components/SolicitudModal";

const MisSolicitudes = () => {
  const { usuario, isLoading } = useAuth(); 
  const [solicitudes, setSolicitudes] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false); 
  // 💡 NUEVO ESTADO para mostrar mensajes de error/info
  const [mensaje, setMensaje] = useState(''); 

    // Función auxiliar para el manejo detallado de errores (replicado de Oficios)
    const extractErrorMessage = (error, defaultMessage) => {
        const errorBody = error.response || {};
        const errorMessage = errorBody.error || defaultMessage;
        return errorMessage + (errorBody.details ? ` (${errorBody.details})` : '');
    };

  const cargarSolicitudes = useCallback(async () => {
    setMensaje(''); // Limpiar el mensaje antes de intentar cargar
    try {
      const data = await apiFetch("/api/solicitudes/cliente"); 
      setSolicitudes(data);
    setMensaje(''); // Limpiar si la carga fue exitosa
    } catch (error) {
      // 💡 REEMPLAZO DE alert()
      const defaultMessage = "Error al cargar solicitudes. Verifica tu conexión o sesión.";
      const fullMessage = extractErrorMessage(error, defaultMessage);

      console.error("Error al cargar solicitudes:", error);
      setMensaje(fullMessage); // ⬅️ Mostrar el mensaje en el estado
    }
  }, []);

  useEffect(() => {
    if (usuario && usuario.roles_keys.includes("cliente")) {
      cargarSolicitudes();
    }
  }, [usuario, cargarSolicitudes]);

  if (isLoading) return <p className="mt-4">Cargando usuario...</p>;

  if (!usuario || !usuario.roles_keys.includes("cliente")) {
    return <h2 className="mt-4">Debes iniciar sesión como Cliente para ver tus Solicitudes.</h2>;
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Mis Solicitudes</h2>
        <button
          className="btn btn-primary"
          onClick={() => setMostrarModal(true)}
        >
          Publicar Solicitud
        </button>
      </div>

      {/* 💡 MOSTRAR MENSAJE DE ERROR/INFO */}
      {mensaje && <div className="alert alert-info">{mensaje}</div>}
      
      {solicitudes.length === 0 && !mensaje && <p>No tienes solicitudes aún. ¡Publica la primera!</p>}

      <div className="solicitudes-list">
        {solicitudes.map((s) => (
          <CardSolicitudes 
            key={s.id}
            solicitud={s}
            usuario={usuario}
            onActualizar={cargarSolicitudes}
          />
        ))}
      </div>
      
      <SolicitudModal
        show={mostrarModal}
        onClose={() => setMostrarModal(false)}
        onSolicitudCreada={cargarSolicitudes} // Esto recarga la lista al crear una nueva solicitud
      />
    </div>
  );
};

export default MisSolicitudes;