import React from 'react';

/**
 * Componente de presentación para mostrar la tabla de resultados del reporte de usuarios.
 * * @param {object} props 
 * @param {Array<object>} props.datos Lista de usuarios a mostrar.
 * @param {boolean} props.loading Estado de carga.
 * @param {string} props.error Mensaje de error a mostrar.
 * @param {React.RefObject} props.printRef Referencia para el contenido a imprimir.
 */
const TablaReporte = ({ datos, loading, error, printRef }) => {
    if (loading || error) {
        return null; 
    }

    return (
        <div ref={printRef} className="mt-4">
            {datos.length === 0 ? (
                <p>No se encontraron datos para el filtro seleccionado.</p>
            ) : (
                <table className="table table-bordered table-striped">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Rol</th> 
                        </tr>
                    </thead>
                    <tbody>
                        {datos.map((d) => (
                            <tr key={d.id}>
                                <td>{d.id}</td>
                                <td>{d.nombre}</td>
                                <td>{d.rol}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default TablaReporte;