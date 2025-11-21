import React, { useState } from 'react';
import { apiFetch } from '../utils/apiFetch';
import { Link } from 'react-router-dom';

const CardContratacion = ({ contratacion, usuario, onActualizar, onResenaPendiente, permisos = {} }) => {
    const [estadoActual, setEstadoActual] = useState(contratacion.estado);

    const handleAccion = async (accion) => {
        try {
            const url = `/api/contrataciones/${contratacion.id}/${accion}`;
            await apiFetch(url, { method: 'PUT' });

            let nuevoEstado = '';
            let mensajeExito = '';

            if (accion === 'aceptar') {
                nuevoEstado = 'Aceptada';
                mensajeExito = 'Contratación aceptada. ¡Manos a la obra!';
            } else if (accion === 'terminar') {
                nuevoEstado = 'Finalizada';
                mensajeExito = 'Contratación finalizada con éxito.';
            } else if (accion === 'cancelar') {
                nuevoEstado = 'Cancelada';
                mensajeExito = 'Contratación cancelada.';
            }
            
            setEstadoActual(nuevoEstado);
            onActualizar && onActualizar('success', mensajeExito);
        } catch (error) {
            console.error("Error al realizar la acción:", error);
            const defaultMessage = `Error al intentar ${accion} la contratación.`;
            const errorMessage = error.response?.error || defaultMessage;
            onActualizar && onActualizar('error', errorMessage);
        }
    };

    const esTrabajador = usuario.roles_keys.includes('trabajador');
    const esCliente = usuario.roles_keys.includes('cliente');
    
    // Lógica para permitir acciones
    const puedeAceptarPorRol = esTrabajador && estadoActual === 'Pendiente';
    const puedeTerminarPorRol = esTrabajador && estadoActual === 'En curso';
    
    // CORREGIDO: Bloquea la cancelación si ya está en estado terminal (incluyendo Caducada)
    const esEstadoFinal = ['Finalizada', 'Cancelada', 'Caducada'].includes(estadoActual);
    
    const puedeCancelarPorRol = 
        (esTrabajador || esCliente) && 
        !esEstadoFinal; // Solo se puede cancelar si NO es un estado final

    const puedeResenarPorRol = 
        esCliente && 
        estadoActual === 'Finalizada' && 
        !contratacion.reseña_id; 

    const reseñaYaHecha = esCliente && estadoActual === 'Finalizada' && contratacion.reseña_id;
    
    // Función para obtener la clase del badge según el estado
    const getEstadoBadgeClass = (estado) => {
        switch (estado) {
            case 'Pendiente':
                return 'bg-warning text-dark';
            case 'Aceptada':
            case 'En curso':
                return 'bg-primary';
            case 'Finalizada':
                return 'bg-success';
            case 'Cancelada':
            case 'Caducada':
                return 'bg-danger';
            default:
                return 'bg-secondary';
        }
    };

    return (
        <div className="card mb-3">
            <div className="card-body">
                <h5 className="card-title">
                {contratacion.id_trabajador ? (
                    <Link 
                        to={`/perfil/${contratacion.id_trabajador}`} 
                        className="text-decoration-none"
                    >
                        {contratacion.trabajador || 'Trabajador no asignado'}
                    </Link>
                ) : (
                    contratacion.trabajador || 'Trabajador no asignado'
                )}
                </h5>
                <p><strong>Cliente:</strong> {contratacion.cliente || 'N/A'}</p>
                <p><strong>Descripción:</strong> {contratacion.descripcion_trabajo || '(sin descripción)'}</p>
                <p><strong>Fecha inicio:</strong> {contratacion.fecha_inicio}</p>
                <p>
                    <strong>Estado:</strong> 
                    <span className={`badge ${getEstadoBadgeClass(estadoActual)} ms-2`}>{estadoActual}</span>
                </p>

                <div className="mt-2 d-flex gap-2">
                    
                    {puedeAceptarPorRol && permisos.aceptar && (
                        <button className="btn btn-success" onClick={() => handleAccion('aceptar')}>
                            Aceptar
                        </button>
                    )}

                    {puedeTerminarPorRol && permisos.terminar && (
                        <button className="btn btn-primary" onClick={() => handleAccion('terminar')}>
                            Terminar
                        </button>
                    )}

                    {puedeCancelarPorRol && permisos.cancelar && (
                        <button className="btn btn-danger" onClick={() => handleAccion('cancelar')}>
                            Cancelar
                        </button>
                    )}

                    {puedeResenarPorRol && permisos.resenar && (
                        <button className="btn btn-warning" onClick={() => onResenaPendiente(contratacion)}>
                            Dejar reseña
                        </button>
                    )}
                    
                    {/* Botones de estado final (solo para mostrar el estado, deshabilitados) */}
                    {estadoActual === 'Caducada' && (
                        <button className="btn btn-secondary" disabled>
                            Caducada
                        </button>
                    )}

                    {reseñaYaHecha && (
                        <button className="btn btn-success" disabled>
                            Reseña Completa
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CardContratacion;