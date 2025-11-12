import React from 'react';

const SessionLogTable = ({ logs, formatearFecha, loadingData, error }) => {
    
    if (loadingData) {
        return <p className="text-info">Cargando historial...</p>;
    }
    
    if (!error && logs.length === 0) {
        return (
            <p className="alert alert-warning shadow-sm">
                No se encontraron logs de sesión para el período seleccionado.
            </p>
        );
    }

    if (error) {
        // El error ya se muestra en el componente padre (SessionLogs)
        return null; 
    }

    // Función auxiliar para determinar la clase de color basada en la acción
    const getBadgeClass = (accion) => {
        if (accion === 'Inicio de Sesión') {
            return 'bg-success'; // Verde para Login
        } else if (accion === 'Cierre de Sesión') {
            return 'bg-danger'; // Rojo para Logout
        } else {
            return 'bg-secondary'; // Gris para otras acciones
        }
    };

    return (
        <div className="table-responsive mt-4 shadow-lg rounded">
            <table className="table table-striped table-hover mb-0">
                <thead className="table-dark">
                    <tr>
                        <th>ID de Sesión</th>
                        <th>Usuario</th>
                        <th>Acción</th>
                        <th>Fecha y Hora (ARG)</th>
                    </tr>
                </thead>
                <tbody>
                    {logs.map((log) => (
                        <tr key={log.Id}>
                            <td>{log.Id || 'N/A'}</td>
                            <td>{log.Nombre}</td>
                            <td>
                                <span className={`badge ${getBadgeClass(log.AccionLog)}`}>
                                    {log.AccionLog}
                                </span>
                            </td>
                            <td>{formatearFecha(log.FechaHoraLog)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default SessionLogTable;