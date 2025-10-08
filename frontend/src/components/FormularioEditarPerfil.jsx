import React, { useState, useEffect } from "react";
import { apiFetch } from "../utils/apiFetch"; // Asumo que usas apiFetch para peticiones autenticadas

const FormularioEditarPerfil = ({ usuario, onUpdate, onCancel }) => {
  // Inicializamos el estado del formulario con los datos actuales del usuario
  const [form, setForm] = useState({
    nombre: usuario.nombre || "",
    contacto: usuario.contacto || "",
    fecha_nacimiento: usuario.fecha_nacimiento || "",
  });

  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [cargando, setCargando] = useState(false);

  // Asegúrate de formatear la fecha_nacimiento al formato YYYY-MM-DD para el input[type="date"]
  useEffect(() => {
    // La fecha puede venir como 'YYYY-MM-DDTHH:MM:SSZ', solo queremos la parte de la fecha
    const fechaFormateada = usuario.fecha_nacimiento 
      ? usuario.fecha_nacimiento.split('T')[0] 
      : "";

    setForm({
      nombre: usuario.nombre || "",
      contacto: usuario.contacto || "",
      fecha_nacimiento: fechaFormateada,
    });
  }, [usuario]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validar = () => {
    if (!/^\d{9,}$/.test(form.contacto)) return "El teléfono debe tener al menos 9 números.";

    if (!form.fecha_nacimiento) return "Falta la fecha de nacimiento.";
    const nacimiento = new Date(form.fecha_nacimiento);
    const hoy = new Date();
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const m = hoy.getMonth() - nacimiento.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) edad--;
    if (edad < 18) return "El usuario debe ser mayor de 18 años.";

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setOk("");
    setCargando(true);

    const msg = validar();
    if (msg) {
      setCargando(false);
      return setError(msg);
    }

    try {
      // Usamos el ID del usuario para hacer la petición de actualización (PUT/PATCH)
      const dataActualizada = await apiFetch(`/api/personas/${usuario.id}`, {
        method: 'PUT', // O PATCH, dependiendo de tu API
        body: JSON.stringify({
          nombre: form.nombre,
          contacto: form.contacto,
          fecha_nacimiento: form.fecha_nacimiento, // Se envía la fecha en el formato del input
        }),
      });

      setOk("Perfil actualizado correctamente.");
      // Llamamos a la función callback para actualizar el estado en MiPerfil
      onUpdate(dataActualizada); 
    } catch (err) {
      const apiErr = err?.response?.data?.error || "Error al actualizar perfil.";
      setError(apiErr);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="card p-4 my-4">
      <h4>Editar Datos Básicos</h4>
      {error && <div className="alert alert-danger">{error}</div>}
      {ok && <div className="alert alert-success">{ok}</div>}
      <form onSubmit={handleSubmit} className="row g-3">
        
        {/* Nombre */}
        <div className="col-12">
          <label className="form-label">Nombre</label>
          <input
            type="text"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            className="form-control"
            required
            disabled={cargando}
          />
        </div>

        {/* Teléfono */}
        <div className="col-md-6">
          <label className="form-label">Teléfono</label>
          <input
            type="text"
            name="contacto"
            value={form.contacto}
            onChange={handleChange}
            className="form-control"
            placeholder="Ej: 112233445"
            required
            disabled={cargando}
          />
        </div>

        {/* Fecha de nacimiento */}
        <div className="col-md-6">
          <label className="form-label">Fecha de nacimiento</label>
          <input
            type="date"
            name="fecha_nacimiento"
            value={form.fecha_nacimiento}
            onChange={handleChange}
            className="form-control"
            required
            disabled={cargando}
          />
        </div>

        <div className="col-12 d-flex gap-2">
          <button type="submit" className="btn btn-success" disabled={cargando}>
            {cargando ? 'Guardando...' : 'Guardar Cambios'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={cargando}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormularioEditarPerfil;