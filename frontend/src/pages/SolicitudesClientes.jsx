import React, { useEffect, useState, useCallback } from "react";
import { apiFetch } from "../utils/apiFetch";
import { useAuth } from "../hooks/useAuth";
import CardSolicitudes from "../components/CardSolicitudes";

const SolicitudesClientes = () => {
    const { usuario, tienePermiso, tieneRol, isLoading } = useAuth();
    const [solicitudes, setSolicitudes] = useState([]);
    const [mensaje, setMensaje] = useState({ tipo: '', texto: '' }); 

    const PERMISO_VER_VISTA = 'ver_solicitudes';
    const PERMISO_TOMAR = 'tomar_solicitud';

    // Función auxiliar para el manejo detallado de errores
    const extractErrorMessage = (error, defaultMessage) => {
        const errorBody = error.response || {};
        const errorMessage = errorBody.error || defaultMessage;
        return errorMessage + (errorBody.details ? ` (${errorBody.details})` : '');
    };
    
    useEffect(() => {
        if (mensaje.texto && mensaje.tipo !== 'info') { 
            const timer = setTimeout(() => {
                setMensaje({ tipo: '', texto: '' });
            }, 5000);    // Limpia el mensaje después de 5 segundos
            return () => clearTimeout(timer);
        }
    }, [mensaje]);

    const cargarSolicitudes = useCallback(async () => {
        
        if (!tienePermiso(PERMISO_VER_VISTA)) return;
        if (!tieneRol('trabajador')) return;
        
        try {
            const data = await apiFetch("/api/solicitudes/disponibles");
            setSolicitudes(data);
            
            
        } catch (error) {
            const defaultMessage = "Error al cargar solicitudes disponibles. Asegúrate de tener oficios y zonas configurados.";
            const fullMessage = extractErrorMessage(error, defaultMessage);
            
            console.error('Error al cargar solicitudes:', error);
            setSolicitudes([]); 
            setMensaje({ tipo: 'danger', texto: fullMessage });
        }
    }, [mensaje.tipo, tienePermiso]);


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
        if (usuario && tienePermiso(PERMISO_VER_VISTA)) {
                    cargarSolicitudes();
                }
            }, [usuario, cargarSolicitudes, tienePermiso]);

        if (isLoading) return <p>Cargando usuario...</p>;

        if (!tienePermiso(PERMISO_VER_VISTA)) {
            return <h2 className="mt-4">No tienes permiso para acceder a las Solicitudes Disponibles.</h2>;
        }

        const permisosTarjeta = {
            puedeCancelar: false, //Se deja por coherencia, el Trabajador no puede Cancelar
            puedeTomar: tienePermiso(PERMISO_TOMAR), 
        };

        if (!usuario) {
            return <h2 className="mt-4">Debes iniciar sesión para ver solicitudes disponibles.</h2>;
        }
    
        const alertClass = `alert-${mensaje.tipo || 'info'}`;

    return (
        <div className="container mt-4">
            <h2>Solicitudes de Clientes Disponibles</h2>
            
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
                    onActualizar={handleFeedbackYRecarga}
                    permisos={permisosTarjeta} 
                />
            ))}
        </div>
    );
};

export default SolicitudesClientes;