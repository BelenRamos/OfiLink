import React from "react";
import { useAuth } from "../../../hooks/useAuth";
import useSessionLogs from "../../../hooks/seguridad/useSessionLogs";

const SessionLogs = () => {
  const authContext = useAuth();
  
  // Consumimos el hook, pasando el contexto de autenticación
  const {
    isLoadingAuth,
    puedeVerLogs,
    logs,
    loadingData,
    error,
    fechaInicio,
    setFechaInicio,
    fechaFin,
    setFechaFin,
    cargarLogs,
    formatearFecha,
  } = useSessionLogs(authContext);

  // --- Renderizado de Estado de Autenticación y Permisos ---

  if (isLoadingAuth) return <div className="container mt-4"><p>Cargando permisos...</p></div>;

  if (!puedeVerLogs) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger" role="alert">
          🚫 Acceso denegado. No tienes el permiso requerido para ver el historial de sesiones.
        </div>
      </div>
    );
  }

  // --- Renderizado de la Vista Principal ---

  return (
    <div className="container mt-4">
      <h2>Logs de Sesión</h2>
      
      {/* Mostrar mensajes de error */}
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="d-flex mb-3 align-items-center">
        {/* Filtro de Fecha de Inicio */}
        <div className="me-2 flex-grow-1">
            <label htmlFor="fechaInicio" className="form-label visually-hidden">Fecha Inicio</label>
            <input
                id="fechaInicio"
                type="date"
                className="form-control"
                placeholder="Fecha de inicio"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                disabled={loadingData}
            />
        </div>
        
        {/* Filtro de Fecha de Fin */}
        <div className="me-2 flex-grow-1">
            <label htmlFor="fechaFin" className="form-label visually-hidden">Fecha Fin</label>
            <input
                id="fechaFin"
                type="date"
                className="form-control"
                placeholder="Fecha de fin"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                disabled={loadingData}
            />
        </div>

        {/* Botón de Filtrar */}
        <button className="btn btn-primary" onClick={cargarLogs} disabled={loadingData}>
          {loadingData ? 'Cargando...' : 'Filtrar'}
        </button>
      </div>
      
      {loadingData && <p>Cargando historial...</p>}
      
      {!loadingData && logs.length === 0 && !error ? (
        <p className="alert alert-warning">No se encontraron logs de sesión para el período seleccionado.</p>
      ) : (
        <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead className="table-light">
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
                    <td>{log.AccionLog}</td>
                    <td>{formatearFecha(log.FechaHoraLog)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
        </div>
      )}
    </div>
  );
};

export default SessionLogs;