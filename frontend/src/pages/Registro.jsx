import React, { useState } from 'react';

const Registro = () => {
  const [form, setForm] = useState({
    nombre: '',
    telefono: '',
    email: '',
    tipo: 'cliente',
    password: '',
    confirmarPassword: '',
  });

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = e => {
    e.preventDefault();

    if (form.password !== form.confirmarPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    // Por ahora sólo mostramos el form en consola
    console.log('Formulario enviado:', form);

    // Aquí luego llamarías al backend para registrar el usuario
  };

  return (
    <div className="container mt-4" style={{ maxWidth: '450px' }}>
      <h2 className="mb-4">Registrarse</h2>
      <form onSubmit={handleSubmit}>

        <div className="mb-3">
          <label className="form-label">Nombre completo</label>
          <input
            type="text"
            className="form-control"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Teléfono</label>
          <input
            type="tel"
            className="form-control"
            name="telefono"
            value={form.telefono}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Email</label>
          <input
            type="email"
            className="form-control"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Tipo de usuario</label>
          <select
            className="form-select"
            name="tipo"
            value={form.tipo}
            onChange={handleChange}
          >
            <option value="cliente">Cliente</option>
            <option value="trabajador">Trabajador</option>
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">Contraseña</label>
          <input
            type="password"
            className="form-control"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            minLength={6}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Confirmar contraseña</label>
          <input
            type="password"
            className="form-control"
            name="confirmarPassword"
            value={form.confirmarPassword}
            onChange={handleChange}
            required
            minLength={6}
          />
        </div>

        <button type="submit" className="btn btn-primary w-100">Registrarse</button>
      </form>
    </div>
  );
};

export default Registro;
