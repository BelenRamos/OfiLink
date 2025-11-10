import React from "react";
import useSolicitudActions from "../hooks/componentes/useSolicitudCard"; 

const CardSolicitudes = ({ solicitud, usuario, onActualizar, permisos }) => {
    // Desestructuramos las propiedades necesarias
    const { 
        id, 
        descripcion_trabajo, 
        cliente, // Cliente es el nombre del cliente (string) o el objeto completo, dependiendo del backend
        estado, 
        oficios_requeridos,
        contacto_cliente // <-- Este campo ahora viene del backend (c.contacto AS contacto_cliente)
    } = solicitud;

    const { puedeCancelar = false, puedeTomar = false } = permisos;
    
    // Usar el hook para obtener los handlers de las acciones
    const { tomarSolicitud, cancelarSolicitud } = useSolicitudActions(id, onActualizar);

    // Lógica de visualización de oficios
    const oficiosDisplay = Array.isArray(oficios_requeridos)
        ? oficios_requeridos.map(o => o.nombre || o.Nombre || 'Oficio Desconocido').join(', ')
        : oficios_requeridos || 'N/D';

    // Obtener la clase de estado
    const estadoClass = 
        estado === 'Abierta' ? 'bg-success' : 
        estado === 'Cancelada' ? 'bg-danger' : 
        estado === 'Caducada' ? 'bg-secondary' : 'bg-warning text-dark';

    // Ahora, simplemente usamos el campo que viene del backend
    const contactoDisplay = contacto_cliente || 'N/D';

    return (
        <div className="card mb-3 shadow-sm">
            <div className="card-body">
                <h5 className="card-title">Trabajo Requerido: {descripcion_trabajo}</h5>
                <p className="card-text">
                    {/* Solo visible si el usuario logueado es un Trabajador */}
                    {usuario?.roles_keys?.includes("trabajador") && (
                        <>
                            {/* Mostrar nombre del cliente (asumiendo que 'cliente' es el nombre, o accedemos a cliente.nombre) */}
                            <strong>Cliente:</strong> {cliente?.nombre || cliente || 'N/D'} <br /> 
                            <strong>Contacto:</strong> {contactoDisplay} <br /> 
                        </>
                    )}
                    
                    <strong>Oficios:</strong> {oficiosDisplay} <br /> 
                    
                    <strong>Estado:</strong> <span className={`badge ${estadoClass}`}>{estado}</span>
                </p>

                <div className="d-flex gap-2">
                    {puedeCancelar && estado === "Abierta" && (
                        <button className="btn btn-danger btn-sm" onClick={cancelarSolicitud}>
                            Cancelar Solicitud
                        </button>
                    )}
                    {puedeTomar && estado === "Abierta" && (
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