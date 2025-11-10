import { useCallback } from 'react';
import { apiFetch } from '../../utils/apiFetch'; 
// Asumimos que apiFetch maneja el envío de datos en el cuerpo de la petición.

/**
 * Hook para manejar las acciones (tomar/cancelar) de una solicitud.
 * @param {number} solicitudId ID de la solicitud a modificar.
 * @param {function} onActualizar Función para notificar el resultado (tipo, mensaje).
 * @returns {object} Funciones de tomarSolicitud y cancelarSolicitud.
 */
const useSolicitudCard = (solicitudId, onActualizar) => {

    const tomarSolicitud = useCallback(async () => {
        try {
            await apiFetch(`/api/solicitudes/${solicitudId}/tomar`, { method: "PUT" });
            onActualizar('success', '¡Solicitud tomada correctamente! ¡Contratación creada!'); 
            
        } catch (error) {
            console.error("Error al tomar la solicitud:", error);

            // Intentar obtener un mensaje de error detallado de la respuesta
            const defaultMessage = "Ocurrió un error al intentar tomar la solicitud. Verifica tu sesión o el estado.";
            const errorMessage = error.response?.error || error.message || defaultMessage;
            
            onActualizar('error', errorMessage);
        }
    }, [solicitudId, onActualizar]);

    const cancelarSolicitud = useCallback(async () => {
        try {
            await apiFetch(`/api/solicitudes/${solicitudId}/cancelar`, { method: "PUT" });
            
            onActualizar('success', 'Solicitud cancelada correctamente.'); 
            
        } catch (error) {
            console.error("Error al cancelar la solicitud:", error);
            
            const defaultMessage = "Ocurrió un error al intentar cancelar la solicitud.";
            const errorMessage = error.response?.error || error.message || defaultMessage;
            
            onActualizar('error', errorMessage);
        }
    }, [solicitudId, onActualizar]);

    return {
        tomarSolicitud,
        cancelarSolicitud,
    };
};

export default useSolicitudCard;