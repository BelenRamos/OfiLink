import { useEffect, useState, useMemo, useCallback } from 'react';
import { apiFetch } from '../utils/apiFetch'; 

export const ESTADOS_CONTRATACION = [
    'Todos', 
    'Pendiente',
    'Aceptada',
    'En curso',
    'Finalizada',
    'Cancelada',
    'Caducada'
];

/**
 * Hook personalizado para gestionar la lógica de Mis Contrataciones:
 * carga de datos, estados de filtro, y manejo de la lista filtrada.
 * @param {Function} tienePermiso 
 * @param {string} PERMISO_VER_CONTRATACIONES 
 */
const useMisContrataciones = (tienePermiso, PERMISO_VER_CONTRATACIONES) => {
    // --- 1. Estados de Datos y Carga ---
    const [contrataciones, setContrataciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // --- 2. Estados de Filtro ---
    const [filtroEstado, setFiltroEstado] = useState('Todos');
    const [filtroBusqueda, setFiltroBusqueda] = useState('');

    // --- 3. Carga de Datos ---
    const cargarContrataciones = useCallback(async () => {
        if (!tienePermiso(PERMISO_VER_CONTRATACIONES)) {
            setError("No tiene permiso para ver sus contrataciones.");
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const data = await apiFetch('/api/contrataciones'); 
            setContrataciones(data);
            setError(null);
        } catch (err) {
            console.error('Error al obtener contrataciones:', err);
            const errorMessage = err.response?.error || "Error al cargar las contrataciones.";
            setError(errorMessage);
            setContrataciones([]);
        } finally {
            setLoading(false);
        }
    }, [tienePermiso, PERMISO_VER_CONTRATACIONES]); 

    useEffect(() => {
        cargarContrataciones();
    }, [cargarContrataciones]); 

    // --- 4. Lógica de Filtrado 
    const contratacionesManejadas = useMemo(() => {
        let resultados = [...contrataciones];
        const terminoBusqueda = filtroBusqueda.toLowerCase();

        // 4.1 FILTRADO POR ESTADO
        if (filtroEstado !== 'Todos') {
            resultados = resultados.filter(c => c.estado === filtroEstado);
        }

        // 4.2 FILTRADO POR BÚSQUEDA DE TEXTO (Trabajador o Cliente)
        if (filtroBusqueda) {
            resultados = resultados.filter(c => 
                (c.trabajador && c.trabajador.toLowerCase().includes(terminoBusqueda)) ||
                (c.cliente && c.cliente.toLowerCase().includes(terminoBusqueda)) ||
                (c.descripcion_trabajo && c.descripcion_trabajo.toLowerCase().includes(terminoBusqueda))
            );
        }

        return resultados;
    }, [contrataciones, filtroEstado, filtroBusqueda]);

    // --- 5. Exportar Valores y Funciones ---
    return {
        contrataciones: contratacionesManejadas,
        loading,
        error,
        filtroEstado,
        setFiltroEstado,
        filtroBusqueda,
        setFiltroBusqueda,
        recargarContrataciones: cargarContrataciones,
    };
};

export default useMisContrataciones;