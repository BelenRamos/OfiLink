import React, { useState, useEffect } from "react";
import { apiFetch } from "../../utils/apiFetch";

const Contrataciones = () => {
  const [contrataciones, setContrataciones] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState("");
  const [error, setError] = useState("");

  const fetchContrataciones = async () => {
    try {
      const data = await apiFetch("/api/contrataciones", {
        method: "GET",
      });
      setContrataciones(data);
    } catch (err) {
      console.error("Error al obtener contrataciones:", err);
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchContrataciones();
  }, []);



    const filtradas = filtroEstado
  ? contrataciones.filter(
      (c) => c.estado?.trim().toLowerCase() === filtroEstado.trim().toLowerCase()
    )
  : contrataciones;


  return (
    <div>
      <h3>Contrataciones</h3>
      {error && <div className="text-danger">{error}</div>}

      <div className="mb-3 d-flex gap-3 align-items-center">
        <label>Filtrar por estado:</label>
        <select
          className="form-select w-auto"
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
        >
          <option value="">Todas</option>
          <option value="Aceptada">Aceptada</option>
          <option value="en curso">En curso</option>
          <option value="finalizada">Finalizada</option>
          <option value="cancelada">Cancelada</option>
        </select>
      </div>

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
          {filtradas.map((c) => (
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
    </div>
  );
};

export default Contrataciones;
