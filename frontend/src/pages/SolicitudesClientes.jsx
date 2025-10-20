import React, { useEffect, useState, useCallback } from "react";
import { apiFetch } from "../utils/apiFetch";
import { useAuth } from "../hooks/useAuth";
import CardSolicitudes from "../components/CardSolicitudes";

const SolicitudesClientes = () => {
    const { usuario, tienePermiso, isLoading } = useAuth();
    const [solicitudes, setSolicitudes] = useState([]);
    // 💡 Estado MEJORADO para incluir tipo de mensaje (success, danger, info)
    const [mensaje, setMensaje] = useState({ tipo: '', texto: '' }); 

    // Función auxiliar para el manejo detallado de errores
    const extractErrorMessage = (error, defaultMessage) => {
        const errorBody = error.response || {};
        const errorMessage = errorBody.error || defaultMessage;
        return errorMessage + (errorBody.details ? ` (${errorBody.details})` : '');
    };
    
    // Efecto para limpiar automáticamente el mensaje después de 5 segundos
    useEffect(() => {
        if (mensaje.texto && mensaje.tipo !== 'info') { 
            const timer = setTimeout(() => {
                setMensaje({ tipo: '', texto: '' });
            }, 5000); 
            return () => clearTimeout(timer);
        }
    }, [mensaje]);

    // La función de carga ahora usa useCallback y limpia/establece el mensaje con tipo
    const cargarSolicitudes = useCallback(async () => {
        // No limpiamos el mensaje aquí para permitir que el mensaje de éxito de una acción se muestre
        
        try {
            const data = await apiFetch("/api/solicitudes/disponibles");
            setSolicitudes(data);
            
            
        } catch (error) {
            // 💡 REEMPLAZO DE alert() por manejo de estado
            const defaultMessage = "Error al cargar solicitudes disponibles. Asegúrate de tener oficios y zonas configurados.";
            const fullMessage = extractErrorMessage(error, defaultMessage);
            
            console.error('Error al cargar solicitudes:', error);
            setSolicitudes([]); 
            setMensaje({ tipo: 'danger', texto: fullMessage }); // ⬅️ Mostrar el error de carga
        }
    }, [mensaje.tipo]);


    /**
     * Función que recibe el feedback (éxito o error) de CardSolicitudes y recarga.
     * @param {string} tipo 'success' o 'error'.
     * @param {string} textoMensaje El mensaje a mostrar.
     */
    const handleFeedbackYRecarga = (tipo, textoMensaje) => {
        setMensaje({ tipo: tipo === 'success' ? 'success' : 'danger', texto: textoMensaje });
        
        // Recargar la lista para que la solicitud tomada desaparezca
        cargarSolicitudes();
    };

    useEffect(() => {
        // Solo carga las solicitudes si el usuario ya está cargado.
        if (usuario) {
            cargarSolicitudes();
        }
    }, [usuario, cargarSolicitudes]);

    if (isLoading) return <p>Cargando usuario...</p>;

    if (!usuario) {
        return <h2 className="mt-4">Debes iniciar sesión para ver solicitudes disponibles.</h2>;
    }
    
    // Clase CSS del alert
    const alertClass = `alert-${mensaje.tipo || 'info'}`;

    return (
        <div className="container mt-4">
            <h2>Solicitudes de Clientes Disponibles</h2>
            
            {/* 💡 MOSTRAR MENSAJE DE ERROR/INFO/ÉXITO */}
            {mensaje.texto && (
                <div className={`alert ${alertClass}`}>{mensaje.texto}</div>
            )}
            
            {solicitudes.length === 0 && mensaje.tipo !== 'danger' && (
                <p>
                    No hay solicitudes disponibles que coincidan con tus oficios y zonas. 
                    Intenta agregar más oficios o zonas a tu perfil.
                </p>
            )}
            
            {solicitudes.map((s) => (
                <CardSolicitudes
                    key={s.id}
                    solicitud={s}
                    usuario={usuario}
                    // onActualizar ahora pasa el feedback de la acción (tomar solicitud)
                    onActualizar={handleFeedbackYRecarga}
                />
            ))}
        </div>
    );
};

export default SolicitudesClientes;