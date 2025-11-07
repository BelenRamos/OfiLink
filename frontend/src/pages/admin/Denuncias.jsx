import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import useDenuncias from '../../hooks/useDenuncias'; 
import DetalleDenunciaModal from '../../components/DetalleDenunciaModal';

const SortIcon = ({ direccion }) => {
    if (direccion === 'asc') return '🔼';
    if (direccion === 'desc') return '🔽';
    return '↕️'; // Icono por defecto (sin ordenar)
};

const Denuncias = () => {
    const { tienePermiso, isLoading: isLoadingAuth } = useAuth();
    const PERMISO_VER_DENUNCIAS = 'ver_denuncias';

    // Usamos el custom hook, extrayendo los estados y handlers necesarios.
    const {
        denuncias,
        denunciasManejadas,
        loading,
        error,
        filtroBusqueda,
        setFiltroBusqueda,
        fechaInicio,
        setFechaInicio,
        fechaFin,
        setFechaFin,
        ordenamiento,
        handleSort,
        denunciaSeleccionada, 
        abrirModalDetalle, 
        cerrarModalDetalle,
    } = useDenuncias(tienePermiso, PERMISO_VER_DENUNCIAS);

    // El estado de carga incluye la autenticación y la carga de datos del hook.
    if (isLoadingAuth || loading) return <p className="mt-4">Cargando permisos y denuncias...</p>;

    if (!tienePermiso(PERMISO_VER_DENUNCIAS)) {
        return <h2 className="mt-4 text-danger">No tienes permiso para ver el listado de denuncias.</h2>;
    }

    return (
        <div className="container mt-4">
            <h3>Denuncias registradas</h3>
            <hr />
            {error && <div className="alert alert-danger">{error}</div>} 

            {/* --- Controles de Filtro --- */}
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
            {/* --------------------------- */}

            {denuncias.length === 0 && !error ? (
                <p>No hay denuncias registradas.</p>
            ) : (
                <>
                    <p className="small text-muted">Mostrando **{denunciasManejadas.length}** de **{denuncias.length}** denuncias.</p>
                    {denunciasManejadas.length === 0 ? (
                        <div className="alert alert-info">No se encontraron denuncias que coincidan con los filtros aplicados.</div>
                    ) : (
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
                    )}
                </>
            )}

            {/* Renderización del Modal */}
            <DetalleDenunciaModal 
                denuncia={denunciaSeleccionada} 
                onClose={cerrarModalDetalle} 
            />
        </div>
    );
};

export default Denuncias;