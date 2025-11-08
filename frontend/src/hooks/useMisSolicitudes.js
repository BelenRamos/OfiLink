import { useEffect, useState, useMemo, useCallback } from "react";
import { apiFetch } from "../utils/apiFetch";

export const ESTADOS_SOLICITUD = [
  "Todos",
  "Abierta", 
  "Tomada", 
  "Cancelada", 
  "Caducada", 
];

/**
 * Hook personalizado para gestionar la lógica de Mis Solicitudes (lado cliente):
 * carga de datos, estados de filtro, y manejo de la lista filtrada.
 * @param {Function} tienePermiso 
 * @param {string} PERMISO_VER_VISTA 
 */
const useMisSolicitudes = (tienePermiso, PERMISO_VER_VISTA) => {
  // --- 1. Estados de Datos y Carga ---
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- 2. Estados de Filtro ---
  const [filtroEstado, setFiltroEstado] = useState("Todos");

  // --- 3. Carga de Datos ---
  const cargarSolicitudes = useCallback(async () => {
    if (!tienePermiso(PERMISO_VER_VISTA)) {
      setError("No tiene permiso para ver sus solicitudes.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch("/api/solicitudes/cliente");
      setSolicitudes(data);
    } catch (err) {
      console.error("Error al obtener solicitudes:", err);
      setError(err.message || "Error al cargar las solicitudes.");
      setSolicitudes([]);
    } finally {
      setLoading(false);
    }
  }, [tienePermiso, PERMISO_VER_VISTA]); 

  useEffect(() => {
    cargarSolicitudes();
  }, [cargarSolicitudes]);

  // --- 4. Lógica de Filtrado 
  const solicitudesManejadas = useMemo(() => {
    let resultados = [...solicitudes];

    // 4.1 FILTRADO POR ESTADO
    if (filtroEstado !== "Todos") {
      resultados = resultados.filter((s) => s.estado === filtroEstado);
    }

    return resultados;
  }, [solicitudes, filtroEstado]);

  // --- 5. Exportar Valores y Funciones ---
  return {
    solicitudes: solicitudesManejadas, 
    loading,
    error,
    filtroEstado,
    setFiltroEstado,
    recargarSolicitudes: cargarSolicitudes,
  };
};

export default useMisSolicitudes;