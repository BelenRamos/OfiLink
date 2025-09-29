import React, { useEffect, useState } from "react";
import { apiFetch } from "../utils/apiFetch";
import { useAuth } from "../hooks/useAuth";
import CardSolicitudes from "../components/CardSolicitudes";

const SolicitudesClientes = () => {
  const { usuario, tienePermiso, isLoading } = useAuth();
  const [solicitudes, setSolicitudes] = useState([]);

  const cargarSolicitudes = async () => {
    try {
      const data = await apiFetch("/api/solicitudes/disponibles");
      setSolicitudes(data);
    } catch (error) {
      console.error(error);
      alert("Error al cargar solicitudes disponibles. Asegúrate de tener oficios y zonas configurados.");
    }
  };

  useEffect(() => {
    // Solo carga las solicitudes si el usuario ya está cargado.
    if (usuario) {
      cargarSolicitudes();
    }
  }, [usuario]);

  if (isLoading) return <p>Cargando usuario...</p>;

  if (!usuario) {
      return <h2 className="mt-4">Debes iniciar sesión para ver solicitudes disponibles.</h2>;
  }

  return (
    <div className="container mt-4">
      <h2>Solicitudes de Clientes Disponibles</h2>
      {solicitudes.length === 0 && (
          <p>
              No hay solicitudes disponibles que coincidan con tus oficios y zonas. 
              Intenta agregar más oficios o zonas a tu perfil.
          </p>
      )}
      {solicitudes.map((s) => (
        <CardSolicitudes
          key={s.id}
          solicitud={s}
          usuario={usuario}
          onActualizar={cargarSolicitudes}
        />
      ))}
    </div>
  );
};

export default SolicitudesClientes;