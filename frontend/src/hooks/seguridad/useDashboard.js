import { useEffect, useState, useCallback, useMemo } from "react";
import { apiFetch } from "../../utils/apiFetch";

const PERMISO_VER_DASHBOARD = 'ver_dashboard';
const DEFAULT_COLORS = ["#CD94C1", "#D4E271", "#71D4E2", "#E271D4"]; // Colores para los gráficos

/**
 * Hook personalizado para manejar la lógica de carga, estado y permisos del Dashboard.
 * @param {object} authContext - Contiene las funciones de useAuth (tienePermiso, isLoading).
 * @returns {object} Todos los estados y datos necesarios para la UI de gráficos.
 */
const useDashboard = ({ tienePermiso, isLoading }) => {
    const [usuariosData, setUsuariosData] = useState([]);
    const [actividadData, setActividadData] = useState([]);
    const [error, setError] = useState(null);

    const puedeVer = tienePermiso(PERMISO_VER_DASHBOARD);
    const isLoadingAuth = isLoading;

    const fetchDashboardData = useCallback(async () => {
        if (!puedeVer) {
            setError("No tienes permiso para ver el Dashboard.");
            return;
        }

        setError(null);
        
        // 1. Cargar resumen de Usuarios
        try {
            const resumen = await apiFetch("/api/personas/resumen");
            const datos = [
                { tipo: "Trabajadores", cantidad: resumen.totalTrabajadores },
                { tipo: "Clientes", cantidad: resumen.totalClientes },
            ].filter(d => d.cantidad > 0); // Filtrar si la cantidad es 0 para el PieChart
            setUsuariosData(datos);

        } catch (err) {
            console.error("Error al obtener resumen de usuarios:", err.message);
            setError((prev) => prev ? prev + " | Error al cargar usuarios." : "Error al cargar datos de usuarios.");
        }

        // 2. Cargar resumen de Actividad
        try {
            const resumen = await apiFetch("/api/estadisticas/solicitudes-contrataciones");
            const datos = [
                { tipo: "Solicitudes", cantidad: resumen.totalSolicitudes },
                { tipo: "Contrataciones", cantidad: resumen.totalContrataciones },
            ];
            setActividadData(datos);
            
        } catch (err) {
            console.error("Error al obtener resumen de actividad:", err.message);
            setError((prev) => prev ? prev + " | Error al cargar actividad." : "Error al cargar datos de actividad.");
        }
    }, [puedeVer]);

    useEffect(() => {
        if (!isLoadingAuth) {
            fetchDashboardData();
        }
    }, [isLoadingAuth, fetchDashboardData]);
    
    // Retorno de estados y datos
    return {
        usuariosData,
        actividadData,
        error,
        puedeVer,
        isLoadingAuth,
        COLORS: DEFAULT_COLORS,
    };
};

export default useDashboard;