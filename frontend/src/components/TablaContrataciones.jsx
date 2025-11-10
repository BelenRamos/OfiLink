import React from 'react';

/**
 * Componente de presentación para el listado de Contrataciones.
 * @param {Array<object>} contrataciones Lista de contrataciones (filtradas) para mostrar.
 * @param {Array<object>} todasContrataciones Lista completa (sin filtrar).
 * @param {string} error Mensaje de error (si existe).
 */
const TablaContrataciones = ({ contrataciones, todasContrataciones, error }) => {
    
    if (todasContrataciones.length === 0 && !error) {
        return <p>No se encontraron contrataciones para mostrar.</p>;
    }

    if (contrataciones.length === 0 && todasContrataciones.length > 0) {
        return <p>No hay contrataciones que coincidan con el estado seleccionado.</p>;
    }
    
    return (
        <table className="table table-bordered table-striped">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Cliente</th>
                    <th>Trabajador</th>
                    <th>Estado</th>
                    <th>Fecha inicio</th>
                    <th>Fecha fin</th>
                </tr>
            </thead>
            <tbody>
                {contrataciones.map((c) => (
                    <tr key={c.id}>
                        <td>{c.id}</td>
                        <td>{c.cliente}</td>
                        <td>{c.trabajador}</td>
                        <td>{c.estado}</td>
                        <td>{c.fecha_inicio?.split("T")[0]}</td>
                        <td>{c.fecha_fin ? c.fecha_fin.split("T")[0] : "-"}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default TablaContrataciones;