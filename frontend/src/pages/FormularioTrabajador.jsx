import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
//import axios from "axios";
import { apiFetch } from "../utils/apiFetch";

const FormularioTrabajador = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state) {
    navigate("/registro");
    return null;
  }

  const [form, setForm] = useState({
    ...state,
    descripcion: "",
    disponibilidad_horaria: "",
    oficiosIds: [],
    zonasIds: [],
  });

  const [zonas, setZonas] = useState([]);
  const [oficios, setOficios] = useState([]);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resZonas, resOficios] = await Promise.all([
          apiFetch("/api/zonas"), 
          apiFetch("/api/oficios"), 
        ]);

        setZonas(resZonas); 
        setOficios(resOficios);
      } catch (err) {
        console.error("Error cargando datos:", err);
        setError("Error al cargar zonas y oficios.");
      }
    };
    fetchData();
  }, []);

  const handleCheckboxChange = (e) => {
    const { name, value, checked } = e.target;
    setForm((prev) => {
      const currentArray = prev[name];
      const updatedArray = checked
        ? [...currentArray, parseInt(value)]
        : currentArray.filter((id) => id !== parseInt(value));
      return { ...prev, [name]: updatedArray };
    });
  };

  const handleTextChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setOk("");

    if (form.oficiosIds.length === 0) {
      return setError("Debe seleccionar al menos un oficio.");
    }
    if (form.zonasIds.length === 0) {
      return setError("Debe seleccionar al menos una zona.");
    }

    try {
      await apiFetch("/api/personas/registrar", {
        method: 'POST',
        body: form, 
      });

      setOk("Trabajador registrado correctamente.");
      navigate("/login");
    } catch (err) {
      const apiErr = err.message || "Error al registrar el trabajador.";
      setError(apiErr);
    }
  };


  return (
    <div className="container mt-4">
      <h2>Registro de Trabajador</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      {ok && <div className="alert alert-success">{ok}</div>}
      <form onSubmit={handleSubmit} className="row g-3">
        <div className="col-12">
          <label htmlFor="descripcion" className="form-label">
            Descripción (Opcional)
          </label>
          <textarea
            id="descripcion"
            name="descripcion"
            value={form.descripcion}
            onChange={handleTextChange}
            className="form-control"
          ></textarea>
        </div>
        <div className="col-md-6">
          <label htmlFor="disponibilidad_horaria" className="form-label">
            Disponibilidad horaria
          </label>
          <input
            type="text"
            id="disponibilidad_horaria"
            name="disponibilidad_horaria"
            value={form.disponibilidad_horaria}
            onChange={handleTextChange}
            className="form-control"
            placeholder="Ej: Lunes y Miércoles de 8 a 16"
          />
        </div>
        <div className="col-md-6">
          <label className="form-label">Oficios</label>
          <div className="border p-3 rounded">
            {oficios.length > 0 ? (
              oficios.map((o) => (
                <div className="form-check" key={o.Id}>
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id={`oficio-${o.Id}`}
                    value={o.Id}
                    name="oficiosIds"
                    checked={form.oficiosIds.includes(o.Id)}
                    onChange={handleCheckboxChange}
                  />
                  <label className="form-check-label" htmlFor={`oficio-${o.Id}`}>
                    {o.Nombre}
                  </label>
                </div>
              ))
            ) : (
              <p>Cargando oficios...</p>
            )}
          </div>
        </div>
        <div className="col-md-6">
          <label className="form-label">Zonas</label>
          <div className="border p-3 rounded">
            {zonas.length > 0 ? (
              zonas.map((z) => (
                <div className="form-check" key={z.Id}>
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id={`zona-${z.Id}`}
                    value={z.Id}
                    name="zonasIds"
                    checked={form.zonasIds.includes(z.Id)}
                    onChange={handleCheckboxChange}
                  />
                  <label className="form-check-label" htmlFor={`zona-${z.Id}`}>
                    {z.Nombre}
                  </label>
                </div>
              ))
            ) : (
              <p>Cargando zonas...</p>
            )}
          </div>
        </div>
        <div className="col-12 mt-3">
          <button type="submit" className="btn btn-primary">
            Registrar Trabajador
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormularioTrabajador;