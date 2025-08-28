import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Formulario de registro — Paso 1 (datos básicos)

const FormularioRegistro = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nombre: "",
    mail: "",
    contacto: "",
    fecha_nacimiento: "",
    contraseña: "",
    tipo_usuario: "cliente",
  });

  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validar = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.mail)) return "El mail no es válido.";

    if (!/^\d{9,}$/.test(form.contacto)) return "El teléfono debe tener al menos 9 números.";

    if (!form.fecha_nacimiento) return "Falta la fecha de nacimiento.";
    const nacimiento = new Date(form.fecha_nacimiento);
    const hoy = new Date();
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const m = hoy.getMonth() - nacimiento.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) edad--;
    if (edad < 18) return "El usuario debe ser mayor de 18 años.";

    if (!form.contraseña || form.contraseña.length < 6) return "La contraseña debe tener al menos 6 caracteres.";

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setOk("");

    const msg = validar();
    if (msg) return setError(msg);

    if (form.tipo_usuario === "trabajador") {
      return navigate("/formularioTrabajador", { state: form, replace: false });
    }

    try {
      await axios.post("/api/personas/registrar", {
        ...form,
        descripcion: null,
        disponibilidad_horaria: null,
        oficiosIds: null,
        zonasIds: null,
      });

      setOk("Usuario registrado correctamente.");
      setForm({
        nombre: "",
        mail: "",
        contacto: "",
        fecha_nacimiento: "",
        contraseña: "",
        tipo_usuario: "cliente",
      });
      navigate("/login");
    } catch (err) {
      const apiErr = err?.response?.data?.error || "Error al registrar usuario.";
      setError(apiErr);
    }
  };

  return (
    // Solución: envolver todo en un solo <div>
    <div className="container mt-4">
      <h2>Registro</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      {ok && <div className="alert alert-success">{ok}</div>}
      <form onSubmit={handleSubmit} className="row g-3">
        {/* Resto del formulario... */}
        <div className="col-12">
          <label className="form-label">Nombre</label>
          <input
            type="text"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>

        <div className="col-12">
          <label className="form-label">Correo electrónico</label>
          <input
            type="email"
            name="mail"
            value={form.mail}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>

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
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">Fecha de nacimiento</label>
          <input
            type="date"
            name="fecha_nacimiento"
            value={form.fecha_nacimiento}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">Contraseña</label>
          <input
            type="password"
            name="contraseña"
            value={form.contraseña}
            onChange={handleChange}
            className="form-control"
            minLength={6}
            required
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">Registrarme como</label>
          <select
            name="tipo_usuario"
            value={form.tipo_usuario}
            onChange={handleChange}
            className="form-select"
          >
            <option value="cliente">Cliente</option>
            <option value="trabajador">Trabajador</option>
          </select>
        </div>

        <div className="col-12">
          <button type="submit" className="btn btn-primary">Continuar</button>
        </div>
      </form>
    </div>
  );
};

export default FormularioRegistro;