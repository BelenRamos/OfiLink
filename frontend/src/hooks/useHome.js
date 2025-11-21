import { useState, useEffect, useCallback, useMemo } from 'react';
import { apiFetch } from '../utils/apiFetch';

/**
 * Hook personalizado para gestionar la lógica de la página principal (Home):
 * carga de contrataciones, estado de filtro (por rol) y manejo de errores.
 * @param {object} auth - Objeto con las propiedades de autenticación (usuario, tienePermiso, tieneRol).
 * @param {function} extractErrorMessage - Función auxiliar para extraer mensajes de error.
 */
const useHome = ({ usuario, tienePermiso, tieneRol }, extractErrorMessage) => {
    // --- 1. Estados de Datos y Filtro ---
    const [contrataciones, setContrataciones] = useState([]);
    const [mensaje, setMensaje] = useState('');
    // El filtro inicial puede ser 'Todas', pero los clientes solo ven 'En curso' por la lógica de filtrado.
    const [filtroEstado, setFiltroEstado] = useState('Todas'); 
    const [modalResenaMostrado, setModalResenaMostrado] = useState(false);
    
    // Estados de Contratación disponibles
    const estadosContratacion = useMemo(() => ['En curso', 'Pendiente', 'Aceptada', 'Finalizada', 'Cancelada', 'Todas'], []);


    // --- 2. Función de Carga de Datos (contrataciones) ---
    const cargarContrataciones = useCallback(async () => {
        if (!usuario) return;
        setMensaje('');

        try {
            // Nota: Se asume que apiFetch está disponible o es el mismo que fetch de la web con una URL base.
            const data = await apiFetch('/api/contrataciones'); 
            setContrataciones(data);
            setMensaje('');
        } catch (error) {
            const fullMessage = extractErrorMessage(error, 'Error al cargar las contrataciones.');
            console.error('Error al cargar contrataciones:', error);
            setMensaje(fullMessage);
        }
    }, [usuario, extractErrorMessage]); // Dependencia de usuario y la función de utilidad

    // --- 3. Efecto de Ejecución ---
    // Carga inicial de contrataciones cuando el usuario está disponible
    useEffect(() => {
        if (usuario) {
            cargarContrataciones();
        }
    }, [usuario, cargarContrataciones]); 

    // --- 4. Lógica de Filtrado (Contrataciones Mostradas) ---
    const contratacionesMostradas = useMemo(() => {
        let mostradas = contrataciones;
        
        if (tieneRol('cliente')) {
            // Los clientes solo ven 'En curso'
            mostradas = contrataciones.filter(c => c.estado === 'En curso');
        } else if (tieneRol('trabajador')) {
            // Los trabajadores filtran por el estado seleccionado
            if (filtroEstado !== 'Todas') {
                mostradas = contrataciones.filter(c => c.estado === filtroEstado);
            }
        }
        
        return mostradas;
    }, [contrataciones, tieneRol, filtroEstado]);

    // --- 5. Lógica de Notificación (Reseñas Pendientes) ---
    const contratacionesPendientesResena = useMemo(() => {
        if (!tieneRol('cliente')) {
            return 0; // Solo aplica para clientes
        }

        // Filtra TODAS las contrataciones cargadas, no solo las mostradas
        const pendientes = contrataciones.filter(c => 
            c.estado === 'Finalizada' && !c.reseña_id
        ).length;

        return pendientes;
    }, [contrataciones, tieneRol]);

    // --- 5. Permisos de Tarjeta ---
    const permisosTarjeta = useMemo(() => ({
        aceptar: !!tienePermiso('contratacion_aceptar'),
        cancelar: !!tienePermiso('contratacion_cancelar'),
        resenar: !!tienePermiso('contratacion_resenar'),
        terminar: !!tienePermiso('contratacion_terminar'),
    }), [tienePermiso]);

    // --- 6. Retorno ---
    return {
        contratacionesMostradas,
        mensaje,
        filtroEstado,
        setFiltroEstado,
        cargarContrataciones, 
        permisosTarjeta,
        estadosContratacion,
        contratacionesPendientesResena,
        modalResenaMostrado,
        setModalResenaMostrado,
    };
};

export default useHome;