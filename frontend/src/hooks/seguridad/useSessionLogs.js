import { useState, useEffect, useCallback } from "react";
// Asumo que useAuth es importado por el componente padre y se pasa como dependencia si fuera necesario, 
// pero aquí solo necesitamos las utilidades que se le pasen.
import { apiFetch } from "../../utils/apiFetch"; 

const PERMISO_VER_LOGS = 'ver_sessionlogs';

/**
 * Hook personalizado para manejar la lógica de la vista SessionLogs.
 *
 * @param {object} authContext - Contiene las funciones de useAuth ({ tienePermiso, isLoading })
 * @returns {object} Estados, setters y handlers para el componente.
 */
const useSessionLogs = ({ tienePermiso, isLoading }) => {
    
    // --- 1. Estados de Datos y Filtros ---
    const [logs, setLogs] = useState([]);
    const [fechaInicio, setFechaInicio] = useState("");
    const [fechaFin, setFechaFin] = useState("");
    
    // --- 2. Estados de UI ---
    const [loadingData, setLoadingData] = useState(false); 
    const [error, setError] = useState(null);

    // --- 3. Permisos ---
    const puedeVerLogs = tienePermiso(PERMISO_VER_LOGS);

    // --- 4. Utilidades ---
    const formatearFecha = useCallback((fecha) => {
        if (!fecha) return 'N/A';
        return new Date(fecha).toLocaleString("es-AR", {
            timeZone: "America/Argentina/Buenos_Aires",
            year: 'numeric', month: 'numeric', day: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit',
        });
    }, []);

    const extractErrorMessage = useCallback((error, defaultMessage) => {
        // Asumiendo que apiFetch maneja errores con una propiedad 'response' o 'message'
        return error.response?.error || error.message || defaultMessage;
    }, []);

    // --- 5. Lógica de Carga de Logs ---
    const cargarLogs = useCallback(async () => {
        if (!puedeVerLogs) {
            setError("No tienes permiso para ver el historial de sesiones.");
            setLogs([]);
            return;
        }

        setLoadingData(true);
        setError(null);

        try {
            const params = new URLSearchParams();
            if (fechaInicio) params.append("fechaInicio", fechaInicio);
            if (fechaFin) params.append("fechaFin", fechaFin);

            const data = await apiFetch(`/api/auth/sessionLogs?${params.toString()}`);
            setLogs(data);

        } catch (err) {
            const errorMessage = extractErrorMessage(err, "Error al cargar los logs de sesión.");
            console.error("Error al cargar logs:", err);
            setError(errorMessage);
            setLogs([]);
        } finally {
            setLoadingData(false);
        }
    }, [puedeVerLogs, fechaInicio, fechaFin, extractErrorMessage]);

    // --- 6. Efecto de Carga Inicial ---
    useEffect(() => {
        // Solo cargar logs si la autenticación ha finalizado y tiene permiso
        if (!isLoading) {
            if (puedeVerLogs) {
                // Ejecutamos la carga inicial (sin filtro de fechas)
                cargarLogs(); 
            } else {
                setLoadingData(false); // Detener la carga si el permiso no existe
            }
        }
    }, [isLoading, puedeVerLogs, cargarLogs]);

    // --- 7. Retorno del Hook ---
    return {
        // Permisos
        isLoadingAuth: isLoading,
        puedeVerLogs,
        
        // Data y Errores
        logs,
        loadingData,
        error,
        
        // Filtros
        fechaInicio,
        setFechaInicio,
        fechaFin,
        setFechaFin,

        // Handlers y Utilidades
        cargarLogs,
        formatearFecha,
    };
};

export default useSessionLogs;