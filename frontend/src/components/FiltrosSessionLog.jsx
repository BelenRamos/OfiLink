import React from 'react';

const FiltrosSessionLog = ({
    fechaInicio,
    setFechaInicio,
    fechaFin,
    setFechaFin,
    cargarLogs,
    loadingData
}) => {
    return (
        <div className="d-flex mb-4 align-items-center bg-light p-3 rounded shadow-sm">
            {/* Filtro de Fecha de Inicio */}
            <div className="me-3 flex-grow-1">
                <label htmlFor="fechaInicio" className="form-label fw-bold mb-1 text-muted">Desde:</label>
                <input
                    id="fechaInicio"
                    type="date"
                    className="form-control"
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                    disabled={loadingData}
                />
            </div>
            
            {/* Filtro de Fecha de Fin */}
            <div className="me-3 flex-grow-1">
                <label htmlFor="fechaFin" className="form-label fw-bold mb-1 text-muted">Hasta:</label>
                <input
                    id="fechaFin"
                    type="date"
                    className="form-control"
                    value={fechaFin}
                    onChange={(e) => setFechaFin(e.target.value)}
                    disabled={loadingData}
                />
            </div>

            {/* Botón de Filtrar */}
            <button 
                className="btn btn-primary self-align-end" 
                onClick={cargarLogs} 
                disabled={loadingData}
                style={{ marginTop: '20px' }} // Ajuste visual para alinear con los inputs
            >
                {loadingData ? 'Cargando...' : 'Filtrar'}
            </button>
        </div>
    );
};

export default FiltrosSessionLog;