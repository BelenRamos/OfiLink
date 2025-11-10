import { useState, useEffect, useCallback, useMemo } from "react";
import { apiFetch } from "../../utils/apiFetch";

const PERMISO_VER_CONTRATACIONES = 'ver_contrataciones';

/**
 * Hook personalizado para manejar la lógica de carga, estado y filtrado del listado de Contrataciones.
 * @param {object} authContext - Contiene las funciones de useAuth (tienePermiso, isLoading).
 * @returns {object} Todos los estados y datos filtrados necesarios para la UI.
 */
const useContrataciones = ({ tienePermiso, isLoading }) => {
    // Estados de datos y control
    const [contrataciones, setContrataciones] = useState([]);
    const [filtroEstado, setFiltroEstado] = useState("");
    const [error, setError] = useState("");
    
    // Función de carga de datos
    const fetchContrataciones = useCallback(async () => {
        if (!tienePermiso(PERMISO_VER_CONTRATACIONES)) {
            // Se deja aca para manejo de errores internos por si se llama incorrectamente.
            return;
        }
        
        try {
            const data = await apiFetch("/api/contrataciones", { method: "GET" });
            setContrataciones(data);
            setError(""); 
        } catch (err) {
            console.error("Error al obtener contrataciones:", err);
            const errorMessage = err.response?.error || err.message || "Error al cargar las contrataciones.";
            setError(errorMessage);
            setContrataciones([]); 
        }
    }, [tienePermiso]);

    useEffect(() => {
        // Solo cargar si la autenticación ya terminó y el usuario tiene el permiso
        if (!isLoading && tienePermiso(PERMISO_VER_CONTRATACIONES)) {
            fetchContrataciones();
        }
    }, [isLoading, tienePermiso, fetchContrataciones]); 

    // Lógica de filtrado (optimizada con useMemo)
    const filtradas = useMemo(() => {
        if (!filtroEstado) {
            return contrataciones;
        }
        // Normalizar el estado y el filtro a minúsculas y sin espacios iniciales/finales
        const filtro = filtroEstado.trim().toLowerCase();

        return contrataciones.filter(
            (c) => c.estado?.trim().toLowerCase() === filtro
        );
    }, [contrataciones, filtroEstado]);

    return {
        contrataciones: filtradas, 
        todasContrataciones: contrataciones,
        filtroEstado,
        setFiltroEstado,
        error,
        puedeVer: tienePermiso(PERMISO_VER_CONTRATACIONES),
        isLoadingAuth: isLoading,
    };
};

export default useContrataciones;