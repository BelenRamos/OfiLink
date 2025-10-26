import React, { useEffect, useState, useRef } from "react";
import { apiFetch } from "../../../utils/apiFetch";
import { imprimirHTML } from "../../../utils/imprimirHTML";
import { useAuth } from "../../../hooks/useAuth"; 


const Auditoria = () => {
    const { tienePermiso, isLoading: isLoadingAuth } = useAuth();
    const [historial, setHistorial] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');
    const printRef = useRef();

    const PERMISO_VER_AUDITORIA = 'ver_auditoria';

    useEffect(() => {
        if (isLoadingAuth) return;
        
        if (tienePermiso(PERMISO_VER_AUDITORIA)) {
            fetchAuditoria();
        } else {
            setLoading(false);
            setError('🚫 Acceso denegado. No tienes permiso para ver el historial de auditoría.');
        }

    }, [fechaInicio, fechaFin, isLoadingAuth, tienePermiso]); 

    const fetchAuditoria = async () => {
        if (!tienePermiso(PERMISO_VER_AUDITORIA)) return;  // Bloqueo interno adicional (Esta aplicado a todos los forms con permisos)

        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (fechaInicio) params.append('fechaInicio', fechaInicio);
            if (fechaFin) params.append('fechaFin', fechaFin);
            const url = `/api/auditorias?${params.toString()}`;
            const data = await apiFetch(url);
            setHistorial(data);
            setError(null);
        } catch (err) {
            console.error('Error cargando la auditoría:', err);
            setError('Error al cargar el historial de auditoría.');
            setHistorial([]);
        } finally {
            setLoading(false);
        }
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return 'N/A';
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('es-ES', options);
    };

    const imprimir = () => {
        if (!tienePermiso(PERMISO_VER_AUDITORIA)) {
            setError('No tienes permiso para imprimir.');
            return;
        }

        if (printRef.current) {
            imprimirHTML(printRef.current.innerHTML, "Historial de Auditoría");
        }
    };

    if (isLoadingAuth || loading) {
        return <div className="container mt-5 text-center"><p>Cargando información de auditoría...</p></div>;
    }
    if (!tienePermiso(PERMISO_VER_AUDITORIA)) {
        return (
            <div className="container mt-4">
                <div className="alert alert-danger" role="alert">
                    🚫 **Acceso denegado.** No tienes el permiso requerido para ver el historial de auditoría.
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-5">
            <div className="card shadow-lg border-0">
                <div className="card-body">
                    <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
                        <h2 className="mb-3 mb-md-0">🕵️‍♂️ Historial de Auditoría</h2>
                        <div className="d-flex flex-wrap align-items-center gap-2">
                            <label htmlFor="fechaInicio" className="me-2 fw-semibold text-muted">Desde:</label>
                            <input
                                type="date"
                                id="fechaInicio"
                                className="form-control form-control-sm"
                                value={fechaInicio}
                                onChange={(e) => setFechaInicio(e.target.value)}
                            />
                            <label htmlFor="fechaFin" className="ms-3 me-2 fw-semibold text-muted">Hasta:</label>
                            <input
                                type="date"
                                id="fechaFin"
                                className="form-control form-control-sm"
                                value={fechaFin}
                                onChange={(e) => setFechaFin(e.target.value)}
                            />
                            <button
                                className="btn btn-outline-secondary ms-3"
                                onClick={imprimir}
                                disabled={historial.length === 0}
                            >
                                🖨️ Imprimir
                            </button>
                        </div>
                    </div>

                    {error && <div className="alert alert-danger shadow-sm">{error}</div>}
                    
                    <p className="text-muted mb-4">
                        Mostrando todas las acciones críticas registradas en el sistema (cambios de perfil, reseteos, estados de cuenta).
                    </p>

                    {historial.length === 0 && !error ? (
                        <div className="alert alert-info shadow-sm">No se encontraron registros de auditoría.</div>
                    ) : (
                        <div ref={printRef} className="table-responsive rounded-3 shadow-sm">
                            <table className="table table-hover align-middle text-center table-bordered">
                                <thead className="table-dark">
                                    <tr>
                                        <th>Fecha/Hora</th>
                                        <th>Tipo</th>
                                        <th>Usuario que Acciona</th>
                                        <th>Persona Afectada</th>
                                        <th>Campo</th>
                                        <th>Valor Anterior</th>
                                        <th>Valor Nuevo</th>
                                        <th>Descripción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {historial.map((reg) => (
                                        <tr key={reg.Id}>
                                            <td className="text-nowrap">{formatDateTime(reg.FechaHora)}</td>
                                            <td><span className="badge bg-primary">{reg.TipoCambio}</span></td>
                                            <td>{reg.usuario_accion_nombre} <br /><small className="text-muted">(ID: {reg.usuario_accion_id})</small></td>
                                            <td>{reg.persona_afectada_nombre} <br /><small className="text-muted">(ID: {reg.persona_afectada_id})</small></td>
                                            <td>{reg.ColumnaAfectada || '—'}</td>
                                            <td className="text-danger">{reg.ValorAnterior || '—'}</td>
                                            <td className="text-success">{reg.ValorNuevo || '—'}</td>
                                            <td className="text-start">{reg.Observaciones}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Auditoria;