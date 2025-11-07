import { useState, useEffect, useCallback } from 'react';

/**
 * Hook personalizado para gestionar la lógica de búsqueda y filtrado de trabajadores:
 * estados de filtro (oficio, zona, calificacion) y carga de datos desde la API.
 */
const useBuscar = (tienePermiso, PERMISO_VER_BUSCAR) => {
    // --- 1. Estados de Filtro ---
    const [oficio, setOficio] = useState('');
    const [zona, setZona] = useState('');
    const [calificacion, setCalificacion] = useState(''); 
    
    // --- 2. Estado de Datos ---
    const [trabajadores, setTrabajadores] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // --- 3. Función de Carga de Datos (con filtros) ---
    const fetchTrabajadores = useCallback(async () => {
        if (!tienePermiso(PERMISO_VER_BUSCAR)) {
            // Manejo de permisos (si aplica)
            setError("No tiene permiso para realizar esta búsqueda.");
            setTrabajadores([]);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const queryParams = new URLSearchParams();
            // Agregar filtros a los parámetros de consulta
            if (oficio) queryParams.append('oficio', oficio);
            if (zona) queryParams.append('zona', zona);
            if (calificacion) queryParams.append('calificacion', calificacion); 

            const res = await fetch(`/api/trabajadores?${queryParams.toString()}`);
            
            if (!res.ok) {
                throw new Error(`Error ${res.status}: Fallo al cargar los trabajadores.`);
            }

            const data = await res.json();
            console.log('Trabajadores filtrados:', data);
            setTrabajadores(data);
        } catch (error) {
            console.error('Error al obtener trabajadores:', error);
            setError(error.message || 'Error al cargar trabajadores.');
            setTrabajadores([]);
        } finally {
            setLoading(false);
        }
    }, [oficio, zona, calificacion, tienePermiso, PERMISO_VER_BUSCAR]); 

    // --- 4. Efecto de Ejecución ---
    // Recarga los trabajadores cada vez que cambian los filtros
    useEffect(() => {
        fetchTrabajadores();
    }, [fetchTrabajadores]); 

    // --- 5. Retorno ---
    return {
        trabajadores,
        loading,
        error,
        oficio,
        setOficio,
        zona,
        setZona,
        calificacion,
        setCalificacion,
    };
};

export default useBuscar;