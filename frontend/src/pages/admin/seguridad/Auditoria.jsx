import React, { useRef } from "react";
import TablaAuditoria from '../../../components/TablaAuditoria'; 
import { useAuth } from "../../../hooks/useAuth"; 
import useAuditoria from '../../../hooks/seguridad/useAuditoria'; 

const Auditoria = () => {
    const printRef = useRef();
    const authHook = useAuth();
    
    const {
        historial,
        fechaInicio,
        fechaFin,
        loading,
        error,
        canView,
        setFechaInicio,
        setFechaFin,
        formatDateTime,
        imprimir,
    } = useAuditoria(authHook, printRef);


    // --- 1. Manejo de Carga y Errores ---
    if (authHook.isLoading || loading) {
        return <div className="container mt-5 text-center"><p className="text-primary fw-bold">Cargando información de auditoría...</p></div>;
    }
    
    if (!canView) {
        return (
            <div className="container mt-4">
                <div className="alert alert-danger shadow-sm" role="alert">
                    🚫 Acceso denegado. No tienes el permiso requerido para ver el historial de auditoría.
                </div>
            </div>
        );
    }

    // --- 2. Renderizado del Contenedor Principal y Filtros ---
    return (
        <div className="container mt-5">
            <div className="card shadow-lg border-0">
                <div className="card-body">
                    <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
                        <h2 className="mb-3 mb-md-0">🕵️‍♂️ Historial de Auditoría</h2>
                        <div className="d-flex flex-wrap align-items-center gap-2">
                            {/* Control de Filtros y Botón de Imprimir */}
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
                        Mostrando todas las acciones críticas registradas en el sistema.
                    </p>

                    {/* 3. Uso del nuevo componente TablaAuditoria */}
                    <TablaAuditoria 
                        historial={historial} 
                        printRef={printRef} 
                        formatDateTime={formatDateTime}
                    />

                </div>
            </div>
        </div>
    );
};

export default Auditoria;