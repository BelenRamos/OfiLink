import React, { useEffect, useState } from "react";
import { apiFetch } from "../../../utils/apiFetch"; 

const Auditoria = () => {
    const [historial, setHistorial] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchAuditoria();
    }, []);

    const fetchAuditoria = async () => {
        try {
            setLoading(true);
            const data = await apiFetch('/api/auditorias'); 
            setHistorial(data);
            setError(null);
        } catch (err) {
            console.error('Error cargando la auditoría:', err);
            setError('Error al cargar el historial de auditoría. Asegúrate de tener permisos de administrador.');
            setHistorial([]);
        } finally {
            setLoading(false);
        }
    };

    // Función auxiliar para formatear la fecha a un formato legible
    const formatDateTime = (dateString) => {
        if (!dateString) return 'N/A';
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('es-ES', options);
    };

    if (loading) {
        return <div className="container mt-4"><p>Cargando historial...</p></div>;
    }

    if (error) {
        return <div className="container mt-4"><div className="alert alert-danger">{error}</div></div>;
    }

    return (
        <div className="container-fluid mt-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2>Historial de Auditoría 🕵️‍♂️</h2>
              <button 
                  className="btn btn-secondary" 
                  onClick={() => window.print()} 
                  disabled={historial.length === 0}
              >
                  Imprimir Historial
              </button>
            </div>
            <p className="text-muted">Mostrando todas las acciones críticas registradas en el sistema (cambios de perfil, reseteos, estados de cuenta).</p>
            
            {historial.length === 0 ? (
                <div className="alert alert-info">No se encontraron registros de auditoría.</div>
            ) : (
                <div className="table-responsive">
                    <table className="table table-striped table-hover table-sm">
                        <thead className="table-dark">
                            <tr>
                                <th>Fecha/Hora</th>
                                <th>Tipo de Acción</th>
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
                                  <td style={{ whiteSpace: 'nowrap' }}>{formatDateTime(reg.FechaHora)}</td> 
                                  <td>
                                      <span className="badge bg-primary">{reg.TipoCambio}</span>
                                  </td>
                                  <td>{reg.usuario_accion_nombre} (ID: {reg.usuario_accion_id})</td>
                                  <td>{reg.persona_afectada_nombre} (ID: {reg.persona_afectada_id})</td>
                                  <td>{reg.ColumnaAfectada || 'N/A'}</td>
                                  <td className="text-danger" style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                      {reg.ValorAnterior || 'N/A'}
                                  </td>
                                  <td className="text-success" style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                      {reg.ValorNuevo || 'N/A'}
                                  </td>
                                  <td>{reg.Observaciones}</td> 
                              </tr>
                          ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Auditoria;