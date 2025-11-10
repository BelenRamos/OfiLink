import { useEffect, useState, useMemo, useCallback } from 'react';
import { apiFetch } from '../../utils/apiFetch'; 

/**
 * Hook personalizado para gestionar la lógica de Denuncias:
 * carga de datos, estados de filtro, ordenamiento y manejo de la lista filtrada/ordenada.
 */
const useDenuncias = (tienePermiso, PERMISO_VER_DENUNCIAS) => {
    // --- 1. Estados de Datos y Carga ---
    const [denuncias, setDenuncias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // --- 2. Estados de Filtro y Ordenamiento ---
    const [filtroBusqueda, setFiltroBusqueda] = useState('');
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');
    const [ordenamiento, setOrdenamiento] = useState({ columna: 'id', direccion: 'asc' });

    // --- 3. Carga de Datos ---
    const cargarDenuncias = useCallback(async () => {
        if (!tienePermiso(PERMISO_VER_DENUNCIAS)) {
            setError("No tiene permiso para ver el listado de denuncias.");
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const data = await apiFetch('/api/denuncias'); 
            setDenuncias(data);
            setError(null);
        } catch (err) {
            console.error('Error al obtener denuncias:', err);
            const errorMessage = err.response?.error || "Error al cargar las denuncias.";
            setError(errorMessage);
            setDenuncias([]);
        } finally {
            setLoading(false);
        }
    }, [tienePermiso, PERMISO_VER_DENUNCIAS]); // Dependencias de useCallback

    useEffect(() => {
        cargarDenuncias();
    }, [cargarDenuncias]); 

    const denunciasManejadas = useMemo(() => {
        let resultados = [...denuncias];

        // 4.1 FILTRADO POR TEXTO GENERAL
        if (filtroBusqueda) {
            const termino = filtroBusqueda.toLowerCase();
            resultados = resultados.filter(d => 
                d.nombre_cliente.toLowerCase().includes(termino) ||
                d.nombre_trabajador.toLowerCase().includes(termino) ||
                d.motivo.toLowerCase().includes(termino) ||
                String(d.id).includes(termino)
            );
        }

        // 4.2 FILTRADO POR RANGO DE FECHAS
        const inicio = fechaInicio ? new Date(fechaInicio) : null;
        const fin = fechaFin ? new Date(fechaFin) : null;

        if (inicio || fin) {
            resultados = resultados.filter(d => {
                const fechaDenuncia = new Date(d.fecha);
                fechaDenuncia.setHours(0, 0, 0, 0); 

                const pasaInicio = !inicio || fechaDenuncia >= inicio;
                const pasaFin = !fin || fechaDenuncia <= fin;
                
                return pasaInicio && pasaFin;
            });
        }

        // 4.3 ORDENAMIENTO POR ID
        if (ordenamiento.columna === 'id') {
            resultados.sort((a, b) => {
                if (ordenamiento.direccion === 'asc') {
                    return a.id - b.id;
                } else {
                    return b.id - a.id;
                }
            });
        }

        return resultados;
    }, [denuncias, filtroBusqueda, fechaInicio, fechaFin, ordenamiento]);


    // --- 5. Handlers de Interfaz (Funciones) ---

    // Función para alternar el orden (asc/desc)
    const handleSort = useCallback((columna) => {
        setOrdenamiento(prev => ({
            columna,
            direccion: prev.columna === columna && prev.direccion === 'asc' ? 'desc' : 'asc'
        }));
    }, []);

    // Exportar todos los valores y funciones necesarios para el componente
    return {
        denuncias,
        denunciasManejadas,
        loading,
        error,
        filtroBusqueda,
        setFiltroBusqueda,
        fechaInicio,
        setFechaInicio,
        fechaFin,
        setFechaFin,
        ordenamiento,
        handleSort,
    };
};

export default useDenuncias;