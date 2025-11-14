import React, { useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import CardSolicitudes from "../components/CardSolicitudes";
import useSolicitudesDisponibles from "../hooks/useSolicitudesDisponibles";
import { Spinner } from "react-bootstrap";

const SolicitudesClientes = () => {
    const { usuario, tienePermiso, tieneRol, isLoading: authLoading } = useAuth();

    const PERMISO_VER_VISTA = "ver_solicitudes";
    const PERMISO_TOMAR = "tomar_solicitud";

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
    }, [usuario, recargarSolicitudes, tienePermiso, authLoading]);

    // Auth + Data
    if (authLoading || isLoadingData)
        return (
            <div className="text-center mt-5">
                <Spinner animation="border" role="status" />
                <p className="mt-3 text-muted">Cargando usuario y datos...</p>
            </div>
        );

    if (!usuario) {
        return (
            <div className="text-center mt-5">
                <h2 className="fw-bold">Debes iniciar sesión</h2>
                <p className="text-muted">Inicia sesión para ver solicitudes disponibles.</p>
            </div>
        );
    }

    if (!tienePermiso(PERMISO_VER_VISTA)) {
        return (
            <div className="text-center mt-5">
                <h2 className="fw-bold text-danger">
                    No tienes permiso para acceder a las Solicitudes Disponibles
                </h2>
            </div>
        );
    }

    const alertClass = `alert ${mensaje.tipo ? `alert-${mensaje.tipo}` : "alert-info"} shadow-sm rounded-3`;

    return (
        <div className="container my-5">
            <div className="text-center mb-4">
                <h2 className="fw-bold">Solicitudes de Clientes Disponibles</h2>
                <p className="text-muted">Estas solicitudes son compatiles con tus oficios y zonas.</p>
            </div>

            {mensaje.texto && (
                <div className={`${alertClass} text-center py-2`}>
                    {mensaje.texto}
                </div>
            )}

            {solicitudes.length === 0 && mensaje.tipo !== "danger" && (
                <div className="text-center mt-5">
                    <p className="fs-5 text-muted">
                        No hay solicitudes disponibles que coincidan con tus oficios o zonas.<br />
                        <span className="fw-medium">
                            Intenta agregar más oficios o zonas a tu perfil.
                        </span>
                    </p>
                </div>
            )}

            <div className="d-flex flex-column gap-3">
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
        </div>
    );
};

export default SolicitudesClientes;
