import React from 'react';

/**
 * Componente de presentación para los controles de filtro del listado de Denuncias.
 * * @param {object} props
 * @param {string} props.filtroBusqueda - Valor actual del campo de búsqueda.
 * @param {function} props.setFiltroBusqueda - Setter para el campo de búsqueda.
 * @param {string} props.fechaInicio - Valor actual del filtro de fecha de inicio.
 * @param {function} props.setFechaInicio - Setter para el filtro de fecha de inicio.
 * @param {string} props.fechaFin - Valor actual del filtro de fecha de fin.
 * @param {function} props.setFechaFin - Setter para el filtro de fecha de fin.
 */
const DenunciasFiltros = ({ 
    filtroBusqueda, 
    setFiltroBusqueda, 
    fechaInicio, 
    setFechaInicio, 
    fechaFin, 
    setFechaFin 
}) => {
    return (
        <div className="row mb-4 bg-light p-3 rounded shadow-sm">
            
            {/* Filtro General por Texto */}
            <div className="col-12 mb-3">
                <label className="form-label fw-bold">Búsqueda General</label>
                <input
                    type="text"
                    className="form-control"
                    placeholder="Buscar por Cliente, Trabajador, Motivo o ID..."
                    value={filtroBusqueda}
                    onChange={(e) => setFiltroBusqueda(e.target.value)}
                />
            </div>
            
            {/* Filtro por Fecha (Inicio) */}
            <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">Fecha de Inicio</label>
                <input
                    type="date"
                    className="form-control"
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                />
            </div>

            {/* Filtro por Fecha (Fin) */}
            <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">Fecha de Fin</label>
                <input
                    type="date"
                    className="form-control"
                    value={fechaFin}
                    onChange={(e) => setFechaFin(e.target.value)}
                />
            </div>
        </div>
    );
};

export default DenunciasFiltros;