import React from "react";
import { apiFetch } from "../utils/apiFetch";

const CardSolicitudes = ({ solicitud, usuario, onActualizar }) => {
    const { id, descripcion_trabajo, cliente, estado, oficios_requeridos } = solicitud;
    
    const tomarSolicitud = async () => {
        try {
            await apiFetch(`/api/solicitudes/${id}/tomar`, { method: "PUT" });
            alert("Solicitud tomada correctamente y Contratación creada.");
            onActualizar();
        } catch (error) {
            console.error("Error al tomar la solicitud:", error);
            alert("Ocurrió un error al intentar tomar la solicitud. Verifica tu sesión o el estado de la solicitud.");
        }
    };

    const cancelarSolicitud = async () => {
        try {
            await apiFetch(`/api/solicitudes/${id}/cancelar`, { method: "PUT" });
            alert("Solicitud cancelada.");
            onActualizar();
        } catch (error) {
            console.error("Error al cancelar la solicitud:", error);
            alert("Ocurrió un error al intentar cancelar la solicitud.");
        }
    };

    const oficiosDisplay = Array.isArray(oficios_requeridos)
        ? oficios_requeridos.map(o => o.nombre || o.Nombre || 'Oficio Desconocido').join(', ')
        : oficios_requeridos || 'N/D';

    return (
        <div className="card mb-3 shadow-sm">
            <div className="card-body">
                <h5 className="card-title">Trabajo Requerido: {descripcion_trabajo}</h5>
                <p className="card-text">
                    {/* Solo visible si está disponible (Trabajador) */}
                    {usuario?.roles_keys?.includes("trabajador") && (
                        <><strong>Cliente:</strong> {cliente || 'N/D'} <br /></>
                    )}
                    {/* Mostrar los oficios requeridos como una lista legible */}
                    <strong>Oficios:</strong> {oficiosDisplay} <br /> 
                    
                    <strong>Estado:</strong> <span className={`badge ${estado === 'Abierta' ? 'bg-success' : estado === 'Cancelada' ? 'bg-danger' : 'bg-warning text-dark'}`}>{estado}</span>
                </p>
                {/* Aca se aplicaran los permisos*/}
                <div className="d-flex gap-2">
                    {usuario?.roles_keys?.includes("cliente") && estado === "Abierta" && (
                        <button className="btn btn-danger btn-sm" onClick={cancelarSolicitud}>
                            Cancelar Solicitud
                        </button>
                    )}
                    {usuario?.roles_keys?.includes("trabajador") && estado === "Abierta" && (
                        <button className="btn btn-success btn-sm" onClick={tomarSolicitud}>
                            Tomar Solicitud
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CardSolicitudes;