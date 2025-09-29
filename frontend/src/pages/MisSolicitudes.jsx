import React, { useEffect, useState, useCallback  } from "react";
import { apiFetch } from "../utils/apiFetch";
import CardSolicitudes from "../components/CardSolicitudes";
import { useAuth } from "../hooks/useAuth";
import SolicitudModal from "../components/SolicitudModal";

const MisSolicitudes = () => {
  const { usuario, isLoading } = useAuth(); 
  const [solicitudes, setSolicitudes] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false); 

  const cargarSolicitudes = useCallback(async () => {
    try {
      const data = await apiFetch("/api/solicitudes/cliente"); 
      setSolicitudes(data);
    } catch (error) {
      console.error("Error al cargar solicitudes:", error);
      alert("Error al cargar solicitudes. Verifica tu conexión o sesión."); 
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

      {solicitudes.length === 0 && <p>No tienes solicitudes aún. ¡Publica la primera!</p>}

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
        onSolicitudCreada={cargarSolicitudes}
      />
    </div>
  );
};

export default MisSolicitudes;
