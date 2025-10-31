import { useEffect, useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { apiFetch } from "../../../utils/apiFetch";

const SessionLogs = () => {
  const { tienePermiso, isLoading } = useAuth();
  const [logs, setLogs] = useState([]);
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [loadingData, setLoadingData] = useState(false); 
  const [error, setError] = useState(null);

    const PERMISO_VER_LOGS = 'ver_sessionlogs';

  const cargarLogs = async () => {
    if (!tienePermiso(PERMISO_VER_LOGS)) {
        setError("No tienes permiso para ver el historial de sesiones.");
        return;
    }

    setLoadingData(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (fechaInicio) params.append("fechaInicio", fechaInicio);
      if (fechaFin) params.append("fechaFin", fechaFin);

      const data = await apiFetch(`/api/auth/sessionLogs?${params.toString()}`);
      setLogs(data);

    } catch (err) {
      const errorMessage = err.message || "Error al cargar los logs de sesión.";
      setError(errorMessage);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (!isLoading) {
        if (tienePermiso(PERMISO_VER_LOGS)) {
            cargarLogs();
        } else {
             setLoadingData(false); // Detener la carga si el permiso no existe
        }
    }
  }, [isLoading, tienePermiso]);

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleString("es-AR", {
      timeZone: "America/Argentina/Buenos_Aires",
    });
  };

  if (isLoading) return <div className="container mt-4"><p>Cargando permisos...</p></div>;

  if (!tienePermiso(PERMISO_VER_LOGS)) {
      return (
          <div className="container mt-4">
              <div className="alert alert-danger" role="alert">
                  🚫 **Acceso denegado.** No tienes el permiso requerido para ver el historial de sesiones.
              </div>
          </div>
      );
  }

  return (
    <div className="container mt-4">
      <h2>Logs de Sesión</h2>
      
      {/* Mostrar mensajes de error */}
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="d-flex mb-3">
        <input
          type="date"
          className="form-control me-2"
          value={fechaInicio}
          onChange={(e) => setFechaInicio(e.target.value)}
          disabled={loadingData}
        />
        <input
          type="date"
          className="form-control me-2"
          value={fechaFin}
          onChange={(e) => setFechaFin(e.target.value)}
          disabled={loadingData}
        />
        <button className="btn btn-primary" onClick={cargarLogs} disabled={loadingData}>
          {loadingData ? 'Cargando...' : 'Filtrar'}
        </button>
      </div>
      
      {loadingData && <p>Cargando historial...</p>}
      
      {!loadingData && logs.length === 0 && !error ? (
        <p>No se encontraron logs de sesión para el período seleccionado.</p>
      ) : (
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Acción</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.Id}>
                <td>{log.Nombre}</td>
                <td>{log.AccionLog}</td>
                <td>{formatearFecha(log.FechaHoraLog)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default SessionLogs;