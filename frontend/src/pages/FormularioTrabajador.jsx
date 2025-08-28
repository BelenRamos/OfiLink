import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const FormularioTrabajador = () => {
  const { state } = useLocation(); // Datos del paso 1
  const navigate = useNavigate();

  // Si no hay datos del paso 1, redirigimos al inicio
  if (!state) {
    navigate("/registro");
    return null;
  }

  const [form, setForm] = useState({
    ...state, // datos básicos
    descripcion: "",
    disponibilidad_horaria: "Disponible",
    oficiosIds: [],
    zonasIds: [],
  });

  const [zonas, setZonas] = useState([]);
  const [oficios, setOficios] = useState([]);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  // 🔹 Cargar Zonas y Oficios desde la API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resZonas, resOficios] = await Promise.all([
          axios.get("/api/zonas"),
          axios.get("/api/oficios"),
        ]);
        setZonas(resZonas.data);
        setOficios(resOficios.data);
      } catch (err) {
        console.error("Error cargando datos:", err);
        setError("Error al cargar zonas y oficios.");
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value, options } = e.target;
    if (name === "oficiosIds" || name === "zonasIds") {
      const selectedOptions = Array.from(options)
        .filter((option) => option.selected)
        .map((option) => option.value);
      setForm((prev) => ({ ...prev, [name]: selectedOptions }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
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
      const datosParaBackend = {
        ...form,
        oficiosIds: form.oficiosIds.join(","), // enviar como string CSV
        zonasIds: form.zonasIds.join(","),
      };

      await axios.post("/api/personas/registrar", datosParaBackend);

      setOk("Trabajador registrado correctamente.");
      navigate("/login");
    } catch (err) {
      const apiErr =
        err?.response?.data?.error || "Error al registrar el trabajador.";
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
          <label className="form-label">Descripción (Opcional)</label>
          <textarea
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
            className="form-control"
          ></textarea>
        </div>

        <div className="col-md-6">
          <label className="form-label">Disponibilidad horaria</label>
          <select
            name="disponibilidad_horaria"
            value={form.disponibilidad_horaria}
            onChange={handleChange}
            className="form-select"
          >
            <option value="Disponible">Disponible</option>
            <option value="No disponible">No disponible</option>
            <option value="A convenir">A convenir</option>
          </select>
        </div>

        <div className="col-md-6">
          <label className="form-label">Oficios</label>
          <select
            name="oficiosIds"
            value={form.oficiosIds}
            onChange={handleChange}
            className="form-select"
            multiple
            required
          >
            {oficios.length > 0 ? (
              oficios.map((o) => (
                <option key={o.Id} value={o.Id}>
                  {o.Nombre}
                </option>
              ))
            ) : (
              <option disabled>Cargando oficios...</option>
            )}
          </select>
        </div>

        <div className="col-md-6">
          <label className="form-label">Zonas</label>
          <select
            name="zonasIds"
            value={form.zonasIds}
            onChange={handleChange}
            className="form-select"
            multiple
            required
          >
            {zonas.length > 0 ? (
              zonas.map((z) => (
                <option key={z.Id} value={z.Id}>
                  {z.Nombre}
                </option>
              ))
            ) : (
              <option disabled>Cargando zonas...</option>
            )}
          </select>
        </div>

        <div className="col-12">
          <button type="submit" className="btn btn-primary">
            Registrar Trabajador
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormularioTrabajador;
