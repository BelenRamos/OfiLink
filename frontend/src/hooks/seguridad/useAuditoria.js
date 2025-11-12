import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "../../utils/apiFetch";
import { imprimirHTML } from "../../utils/imprimirHTML";

const PERMISO_VER_AUDITORIA = 'ver_auditoria';

/**
 * Hook personalizado para manejar la lógica de la pantalla de Historial de Auditoría.
 * Se encarga de la verificación de permisos, la carga de datos con filtros
 * y el formateo de fechas.
 * * @param {object} authHook - El objeto devuelto por useAuth para manejar permisos.
 * @param {object} printRef - Referencia de React para el contenido imprimible.
 */
const useAuditoria = ({ tienePermiso, isLoading: isLoadingAuth }, printRef) => {
    // --- 1. Estados de Datos y UI ---
    const [historial, setHistorial] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');
    
    // --- 2. Funciones de Lógica ---

    /**
     * Carga el historial de auditoría desde la API, aplicando filtros de fecha si existen.
     */
    const fetchAuditoria = useCallback(async () => {
        // No intentar cargar si la autenticación aún está pendiente o si no tiene permiso.
        if (isLoadingAuth || !tienePermiso(PERMISO_VER_AUDITORIA)) {
            if (!isLoadingAuth && !tienePermiso(PERMISO_VER_AUDITORIA)) {
                setLoading(false);
                setError('🚫 Acceso denegado. No tienes permiso para ver el historial de auditoría.');
            }
            return;
        }

        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (fechaInicio) params.append('fechaInicio', fechaInicio);
            if (fechaFin) params.append('fechaFin', fechaFin);
            
            const url = `/api/auditorias?${params.toString()}`;
            const data = await apiFetch(url);
            
            setHistorial(data);
            setError(null);
        } catch (err) {
            console.error('Error cargando la auditoría:', err);
            setError('Error al cargar el historial de auditoría. Inténtalo de nuevo.');
            setHistorial([]);
        } finally {
            setLoading(false);
        }
    }, [fechaInicio, fechaFin, isLoadingAuth, tienePermiso]);

    /**
     * Formatea una cadena de fecha a un formato de fecha y hora local.
     */
    const formatDateTime = useCallback((dateString) => {
        if (!dateString) return 'N/A';
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };  // Se asegura que el formato sea consistente
        return new Date(dateString).toLocaleDateString('es-ES', options);
    }, []);

    /**
     * Imprime el contenido del elemento referenciado.
     */
    const imprimir = useCallback(() => {
        if (!tienePermiso(PERMISO_VER_AUDITORIA)) {
            setError('No tienes permiso para imprimir.');
            return;
        }

        if (printRef.current) {
            imprimirHTML(printRef.current.innerHTML, "Historial de Auditoría");
        }
    }, [printRef, tienePermiso]);

    // --- 3. Efecto para Carga de Datos ---
    
    // Se ejecuta al inicio y cada vez que cambian las fechas de filtro
    useEffect(() => {
        if (!isLoadingAuth) {
            fetchAuditoria();
        }
    }, [fechaInicio, fechaFin, isLoadingAuth, fetchAuditoria]); 
    
    return {
        historial,
        fechaInicio,
        fechaFin,
        loading,
        error,
        canView: tienePermiso(PERMISO_VER_AUDITORIA),
        setFechaInicio,
        setFechaFin,
        formatDateTime,
        imprimir,
    };
};

export default useAuditoria;