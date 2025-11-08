import { useEffect, useState, useCallback, useMemo } from "react";
import { apiFetch } from "../utils/apiFetch";

const extractErrorMessage = (error, defaultMessage) => {
    // Si apiFetch lanza un Error que contiene la respuesta parseada
    // Asumiendo que 'error' podría tener una propiedad 'response' si la API lo estructura así
    const errorBody = error.response || {}; 
    const errorMessage = error.message || errorBody.error || defaultMessage;
    
    // Si el error original tenía una estructura de detalles, se puede añadir
    return errorMessage + (errorBody.details ? ` (${errorBody.details})` : '');
};

/**
 * Hook personalizado para gestionar la lógica de carga y manejo de solicitudes disponibles.
 * * @param {Function} tienePermiso 
 * @param {Function} tieneRol 
 * @param {string} PERMISO_VER_VISTA 
 * @param {string} PERMISO_TOMAR 
 */
const useSolicitudesDisponibles = (tienePermiso, tieneRol, PERMISO_VER_VISTA, PERMISO_TOMAR) => {
    const [solicitudes, setSolicitudes] = useState([]);
    const [mensaje, setMensaje] = useState({ tipo: '', texto: '' }); 
    const [loading, setLoading] = useState(false); 

    // Lógica de limpieza de feedback 
    useEffect(() => {
        if (mensaje.texto && mensaje.tipo !== 'info') { 
            const timer = setTimeout(() => {
                setMensaje({ tipo: '', texto: '' });
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [mensaje]);

    // Función principal de carga 
    const cargarSolicitudes = useCallback(async () => {
        
        if (!tienePermiso(PERMISO_VER_VISTA) || !tieneRol('trabajador')) {
            setSolicitudes([]);
            setLoading(false);
            return; 
        }
        
        setLoading(true); 
        
        try {
            const data = await apiFetch("/api/solicitudes/disponibles");
            setSolicitudes(data);
            if (mensaje.tipo === 'danger') setMensaje({ tipo: '', texto: '' }); 
        } catch (error) {
            const defaultMessage = "Error al cargar solicitudes disponibles. Asegúrate de tener oficios y zonas configurados.";
            const fullMessage = extractErrorMessage(error, defaultMessage);
            
            console.error('Error al cargar solicitudes:', error);
            setSolicitudes([]); 
            setMensaje({ tipo: 'danger', texto: fullMessage });
        } finally {
            setLoading(false); 
        }
    }, [PERMISO_VER_VISTA, tienePermiso, tieneRol, mensaje.tipo]); 

    const handleFeedbackYRecarga = useCallback((tipo, textoMensaje) => {
        setMensaje({ tipo: tipo === 'success' ? 'success' : 'danger', texto: textoMensaje });
        cargarSolicitudes();
    }, [cargarSolicitudes]);

    const permisosTarjeta = useMemo(() => ({
        puedeCancelar: false, // El trabajador no cancela solicitudes
        puedeTomar: tienePermiso(PERMISO_TOMAR), 
    }), [tienePermiso, PERMISO_TOMAR]);

    return {
        solicitudes,
        mensaje,
        isLoadingData: loading, 
        recargarSolicitudes: cargarSolicitudes,
        handleFeedbackYRecarga,
        permisosTarjeta,
    };
};

export default useSolicitudesDisponibles;