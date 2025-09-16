import { useEffect, useState } from "react";

const SessionLogs = () => {
  const [logs, setLogs] = useState([]);
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  const cargarLogs = async () => {
    try {
      const params = new URLSearchParams();
      if (fechaInicio) params.append("fechaInicio", fechaInicio);
      if (fechaFin) params.append("fechaFin", fechaFin);

      const res = await fetch(`/api/auth/sessionLogs?${params.toString()}`);
      const data = await res.json();
      setLogs(data);
    } catch (err) {
      console.error("Error cargando logs:", err);
    }
  };

  useEffect(() => {
    cargarLogs();
  }, []);

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleString("es-AR", {
      timeZone: "America/Argentina/Buenos_Aires",
    });
  };

  return (
    <div className="container mt-4">
      <h2>Logs de Sesión</h2>
      <div className="d-flex mb-3">
        <input
          type="date"
          className="form-control me-2"
          value={fechaInicio}
          onChange={(e) => setFechaInicio(e.target.value)}
        />
        <input
          type="date"
          className="form-control me-2"
          value={fechaFin}
          onChange={(e) => setFechaFin(e.target.value)}
        />
        <button className="btn btn-primary" onClick={cargarLogs}>
          Filtrar
        </button>
      </div>

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
    </div>
  );
};

export default SessionLogs;
