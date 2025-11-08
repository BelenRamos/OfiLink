import React, { useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import CardSolicitudes from "../components/CardSolicitudes";
import useSolicitudesDisponibles from "../hooks/useSolicitudesDisponibles"; 
import { Spinner } from 'react-bootstrap';

const SolicitudesClientes = () => {
    const { usuario, tienePermiso, tieneRol, isLoading: authLoading } = useAuth();
    
    const PERMISO_VER_VISTA = 'ver_solicitudes';
    const PERMISO_TOMAR = 'tomar_solicitud';

    const {
        solicitudes,
        mensaje,
        isLoadingData,
        recargarSolicitudes,
        handleFeedbackYRecarga,
        permisosTarjeta,
    } = useSolicitudesDisponibles(tienePermiso, tieneRol, PERMISO_VER_VISTA, PERMISO_TOMAR);

    useEffect(() => {
        if (usuario && !authLoading) {
            recargarSolicitudes();
        }
        // Dependencias incluyen usuario y tienePermiso (a través de recargarSolicitudes),
        // y authLoading para que se ejecute una vez que la autenticación termine.
    }, [usuario, recargarSolicitudes, tienePermiso, authLoading]);

    //Auth + Data
    if (authLoading || isLoadingData) return <p className="mt-4"><Spinner animation="border" size="sm" /> Cargando usuario/datos...</p>;

    if (!usuario) {
        return <h2 className="mt-4">Debes iniciar sesión para ver solicitudes disponibles.</h2>;
    }

    if (!tienePermiso(PERMISO_VER_VISTA)) {
        return <h2 className="mt-4">No tienes permiso para acceder a las Solicitudes Disponibles.</h2>;
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