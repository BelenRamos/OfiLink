import React from 'react';

/**
 * Componente que muestra el ícono de ordenamiento.
 */
const SortIcon = ({ direccion }) => {
    if (direccion === 'asc') return ' 🔼';
    if (direccion === 'desc') return ' 🔽';
    return ' ↕️';
};

/**
 * Componente de presentación para la tabla de denuncias.
 * * @param {object} props
 * @param {Array<object>} props.denunciasManejadas - Lista de denuncias filtradas y ordenadas.
 * @param {number} props.totalDenuncias - Número total de denuncias antes del filtro.
 * @param {object} props.ordenamiento - Objeto { columna: string, direccion: 'asc' | 'desc' }.
 * @param {function} props.handleSort - Handler para cambiar el ordenamiento.
 * @param {function} props.abrirModalDetalle - Handler para abrir el modal con la denuncia.
 * @param {string | null} props.error - Mensaje de error (si existe).
 */
const TablaDenuncias = ({ 
    denunciasManejadas, 
    totalDenuncias, 
    ordenamiento, 
    handleSort, 
    abrirModalDetalle,
    error
}) => {

    if (denunciasManejadas.length === 0) {
        if (totalDenuncias > 0) {
            return <div className="alert alert-info">No se encontraron denuncias que coincidan con los filtros aplicados.</div>;
        }
        if (!error) {
            return <p>No hay denuncias registradas.</p>;
        }
    }
    
    return (
        <>
            <p className="small text-muted">Mostrando {denunciasManejadas.length} de {totalDenuncias} denuncias.</p>
            <table className="table table-striped table-hover">
                <thead>
                    <tr>
                        {/* Encabezado con Ordenamiento por ID */}
                        <th onClick={() => handleSort('id')} style={{ cursor: 'pointer' }}>
                            ID <SortIcon direccion={ordenamiento.columna === 'id' ? ordenamiento.direccion : ''} />
                        </th>
                        <th>Cliente</th>
                        <th>Trabajador</th>
                        <th>Motivo</th>
                        <th>Fecha</th>
                    </tr>
                </thead>
                <tbody>
                    {denunciasManejadas.map((d) => (
                        <tr 
                            key={d.id}
                            onClick={() => abrirModalDetalle(d)} 
                            style={{ cursor: 'pointer' }} 
                        >
                            <td>{d.id}</td>
                            <td>{d.nombre_cliente}</td>
                            <td>{d.nombre_trabajador}</td>
                            <td>{d.motivo.length > 50 ? d.motivo.substring(0, 50) + '...' : d.motivo}</td> 
                            <td>{new Date(d.fecha).toLocaleDateString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    );
};

export default TablaDenuncias;