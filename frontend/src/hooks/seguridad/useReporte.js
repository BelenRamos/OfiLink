import { useEffect, useState, useCallback } from 'react';
import { apiFetch } from "../../utils/apiFetch";

const PERMISO_VER_REPORTE = 'ver_reporte';

/**
 * Hook personalizado para manejar la lógica de carga, estado y filtrado del reporte de personas.
 * @param {object} authContext - Contiene las funciones de useAuth (tienePermiso, isLoading).
 * @returns {object} Todos los estados y handlers necesarios para la UI.
 */
const useReporte = ({ tienePermiso, isLoading }) => {
    const [datos, setDatos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filtroTipo, setFiltroTipo] = useState('todos'); 
    
    const puedeVer = tienePermiso(PERMISO_VER_REPORTE);

    const fetchDatos = useCallback(async (currentfiltroTipo) => {
        if (!puedeVer) {
            setLoading(false);
            setError('No tienes permiso para ver el reporte.');
            return;
        }

        setLoading(true); 
        setError('');
        try {
            let url = '/api/personas/reporte';
            if (currentfiltroTipo && currentfiltroTipo !== 'todos') {
                url += `?rol=${currentfiltroTipo}`; 
            }

            const data = await apiFetch(url); 
            setDatos(data); 

        } catch (err) {
            console.error('Error al obtener reporte:', err);
            
            const errorMessage = err.response?.error || err.message || 'No se pudo cargar el reporte.';
            setError(errorMessage);
            setDatos([]);
        } finally {
            setLoading(false);
        }
    }, [puedeVer]);

    useEffect(() => {
        if (!isLoading) {
            // Se llama a fetchDatos con el valor actual de filtroTipo
            fetchDatos(filtroTipo);
        }
    }, [filtroTipo, isLoading, fetchDatos]);
    
    const imprimir = useCallback(() => {
        if (!puedeVer) {
            setError('No tienes permiso para imprimir el reporte.');
            return false;
        }
        return true; 
    }, [puedeVer]);

    return {
        datos,
        loading,
        error,
        filtroTipo,
        setFiltroTipo,
        imprimir,
        puedeVer,
        isLoadingAuth: isLoading,
    };
};

export default useReporte;