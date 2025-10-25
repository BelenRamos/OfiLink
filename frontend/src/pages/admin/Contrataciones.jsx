import React, { useState, useEffect } from "react";
import { apiFetch } from "../../utils/apiFetch";
import { useAuth } from "../../hooks/useAuth";

const Contrataciones = () => {
  const { tienePermiso, isLoading } = useAuth();
  const [contrataciones, setContrataciones] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState("");
  const [error, setError] = useState("");

  const PERMISO_VER_CONTRATACIONES = 'ver_contrataciones';

  const fetchContrataciones = async () => {
    if (!tienePermiso(PERMISO_VER_CONTRATACIONES)) {
      setError("No tienes permiso para ver el listado de contrataciones.");
      return;
    }
    
    try {
      const data = await apiFetch("/api/contrataciones", {
        method: "GET",
      });
      setContrataciones(data);
      setError(""); 
    } catch (err) {
      console.error("Error al obtener contrataciones:", err);
      const errorMessage = err.response?.error || err.message || "Error al cargar las contrataciones.";
      setError(errorMessage);
      setContrataciones([]); 
    }
  };

  useEffect(() => {
    if (!isLoading && tienePermiso(PERMISO_VER_CONTRATACIONES)) {
        fetchContrataciones();
    }
  }, [isLoading, tienePermiso]); 


    const filtradas = filtroEstado
  ? contrataciones.filter(
      (c) => c.estado?.trim().toLowerCase() === filtroEstado.trim().toLowerCase()
    )
  : contrataciones;

  if (isLoading) return <p className="mt-4">Cargando permisos...</p>;

  if (!tienePermiso(PERMISO_VER_CONTRATACIONES)) {
      return <h2 className="mt-4 text-danger">No tienes permiso para ver el listado de contrataciones.</h2>;
  }

  return (
    <div className="container mt-4">
      <h3>Contrataciones</h3>
      {error && <div className="alert alert-danger">{error}</div>}

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

      {contrataciones.length === 0 && !error ? (
        <p>No se encontraron contrataciones para mostrar.</p>
      ) : (
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
      )}
    </div>
  );
};

export default Contrataciones;