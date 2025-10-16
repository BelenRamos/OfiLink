import React, { useEffect, useState } from "react";
import { apiFetch } from "../utils/apiFetch";
import { useAuth } from "../hooks/useAuth";
import CardSolicitudes from "../components/CardSolicitudes";

const SolicitudesClientes = () => {
    const { usuario, tienePermiso, isLoading } = useAuth();
    const [solicitudes, setSolicitudes] = useState([]);
    // 💡 NUEVO ESTADO para mostrar mensajes de error/info
    const [mensaje, setMensaje] = useState(''); 

    // Función auxiliar para el manejo detallado de errores
    const extractErrorMessage = (error, defaultMessage) => {
        const errorBody = error.response || {};
        const errorMessage = errorBody.error || defaultMessage;
        return errorMessage + (errorBody.details ? ` (${errorBody.details})` : '');
    };

    const cargarSolicitudes = async () => {
        setMensaje(''); // Limpiar el mensaje antes de la carga
        try {
            const data = await apiFetch("/api/solicitudes/disponibles");
            setSolicitudes(data);
            setMensaje(''); // Limpiar si todo fue bien (o establecer un mensaje de éxito si fuera necesario)
        } catch (error) {
            // 💡 REEMPLAZO DE alert()
            const defaultMessage = "Error al cargar solicitudes disponibles. Asegúrate de tener oficios y zonas configurados.";
            const fullMessage = extractErrorMessage(error, defaultMessage);
            
            console.error('Error al cargar solicitudes:', error);
            setMensaje(fullMessage); // ⬅️ Mostrar el mensaje en el estado
        }
    };

    useEffect(() => {
        // Solo carga las solicitudes si el usuario ya está cargado.
        if (usuario) {
            cargarSolicitudes();
        }
    }, [usuario]);

    if (isLoading) return <p>Cargando usuario...</p>;

    if (!usuario) {
        return <h2 className="mt-4">Debes iniciar sesión para ver solicitudes disponibles.</h2>;
    }

    // El CardSolicitudes (componente hijo) probablemente contendrá acciones (ej. "aceptar")
    // que llamen a onActualizar, lo cual recargará los datos y limpiará el mensaje.

    return (
        <div className="container mt-4">
            <h2>Solicitudes de Clientes Disponibles</h2>
            
            {/* 💡 MOSTRAR MENSAJE DE ERROR/INFO */}
            {mensaje && <div className="alert alert-info">{mensaje}</div>}
            
            {solicitudes.length === 0 && !mensaje && (
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
                    onActualizar={cargarSolicitudes}
                />
            ))}
        </div>
    );
};

export default SolicitudesClientes;