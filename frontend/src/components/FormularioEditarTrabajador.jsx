import React, { useState, useEffect } from "react";
import { apiFetch } from "../utils/apiFetch"; 

const FormularioEditarTrabajador = ({ 
  perfilTrabajador, 
  onUpdate, 
  onCancel,
  userId 
}) => {
  const [zonasDisponibles, setZonasDisponibles] = useState([]);
  const [oficiosDisponibles, setOficiosDisponibles] = useState([]);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [cargando, setCargando] = useState(false);
  const [form, setForm] = useState({
    descripcion: perfilTrabajador?.descripcion || "",
    disponibilidad_horaria: perfilTrabajador?.disponibilidad_horaria || "",
    oficiosIds: perfilTrabajador?.oficiosIds || [], 
    zonasIds: perfilTrabajador?.zonasIds || [],
  });

  useEffect(() => {
    const fetchData = async () => {
      setCargando(true);
      try {
        const [resZonas, resOficios] = await Promise.all([
          apiFetch("/api/zonas"), 
          apiFetch("/api/oficios"),
        ]);
        setZonasDisponibles(resZonas);
        setOficiosDisponibles(resOficios);
      } catch (err) {
        console.error("Error cargando datos:", err);
        setError("Error al cargar zonas y oficios.");
      } finally {
        setCargando(false);
      }
    };
    fetchData();
  }, []);

  const handleCheckboxChange = (e) => {
    const { name, value, checked } = e.target;
    const id = parseInt(value);

    setForm((prev) => {
      const currentArray = prev[name];
      const updatedArray = checked
        ? [...currentArray, id]
        : currentArray.filter((item) => item !== id);
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
    setCargando(true);

    if (form.oficiosIds.length === 0) {
      setCargando(false);
      return setError("Debe seleccionar al menos un oficio.");
    }
    if (form.zonasIds.length === 0) {
      setCargando(false);
      return setError("Debe seleccionar al menos una zona.");
    }

    try {
      // Se usa ID del trabajador para actualizar el perfil
      const dataActualizada = await apiFetch(`/api/trabajadores/${userId}`, {
        method: 'PUT',
        body: JSON.stringify({
          descripcion: form.descripcion,
          disponibilidad_horaria: form.disponibilidad_horaria,
          oficiosIds: form.oficiosIds,
          zonasIds: form.zonasIds,
        }),
      });

      setOk("Perfil de trabajador actualizado correctamente.");
      onUpdate(dataActualizada); 
    } catch (err) {
      const apiErr = err?.response?.data?.error || "Error al actualizar el perfil de trabajador.";
      setError(apiErr);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="card p-4 my-4">
      <h4>Editar Perfil de Trabajador</h4>
      {error && <div className="alert alert-danger">{error}</div>}
      {ok && <div className="alert alert-success">{ok}</div>}
      {cargando && oficiosDisponibles.length === 0 ? <p>Cargando opciones...</p> : (
        <form onSubmit={handleSubmit} className="row g-3">
          
          {/* Descripción */}
          <div className="col-12">
            <label htmlFor="descripcion" className="form-label">Descripción</label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={form.descripcion}
              onChange={handleTextChange}
              className="form-control"
              disabled={cargando}
            ></textarea>
          </div>
          
          {/* Disponibilidad Horaria */}
          <div className="col-12">
            <label htmlFor="disponibilidad_horaria" className="form-label">Disponibilidad horaria</label>
            <input
              type="text"
              id="disponibilidad_horaria"
              name="disponibilidad_horaria"
              value={form.disponibilidad_horaria}
              onChange={handleTextChange}
              className="form-control"
              placeholder="Ej: Lunes y Miércoles de 8 a 16"
              disabled={cargando}
            />
          </div>

          {/* Oficios */}
          <div className="col-md-6">
            <label className="form-label">Oficios</label>
            <div className="border p-3 rounded" style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {oficiosDisponibles.map((o) => (
                <div className="form-check" key={o.Id}>
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id={`oficio-${o.Id}`}
                    value={o.Id}
                    name="oficiosIds"
                    checked={form.oficiosIds.includes(o.Id)}
                    onChange={handleCheckboxChange}
                    disabled={cargando}
                  />
                  <label className="form-check-label" htmlFor={`oficio-${o.Id}`}>
                    {o.Nombre}
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          {/* Zonas */}
          <div className="col-md-6">
            <label className="form-label">Zonas</label>
            <div className="border p-3 rounded" style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {zonasDisponibles.map((z) => (
                <div className="form-check" key={z.Id}>
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id={`zona-${z.Id}`}
                    value={z.Id}
                    name="zonasIds"
                    checked={form.zonasIds.includes(z.Id)}
                    onChange={handleCheckboxChange}
                    disabled={cargando}
                  />
                  <label className="form-check-label" htmlFor={`zona-${z.Id}`}>
                    {z.Nombre}
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          {/* Botones */}
          <div className="col-12 mt-3 d-flex gap-2">
            <button type="submit" className="btn btn-success" disabled={cargando}>
              {cargando ? 'Guardando...' : 'Guardar Perfil Trabajador'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={cargando}>
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default FormularioEditarTrabajador;