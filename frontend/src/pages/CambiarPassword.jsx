import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CambiarPassword = () => {
  const [credenciales, setCredenciales] = useState({ email: '', oldPassword: '', newPassword: '' });
  const [mensaje, setMensaje] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredenciales({ ...credenciales, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/cambiarPassword', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credenciales),
      });

      const data = await res.json();
      setMensaje(data.mensaje);

      if (res.ok) {
        alert(data.mensaje);
        navigate('/login');
      }
    } catch (error) {
      setMensaje('Error al cambiar la contraseña. Inténtalo de nuevo.');
    }
  };

  return (
    <div className="container mt-4" style={{ maxWidth: '400px' }}>
      <h2 className="mb-4">Cambiar Contraseña</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input
            name="email"
            value={credenciales.email}
            onChange={handleChange}
            type="email"
            className="form-control"
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Contraseña Actual</label>
          <input
            name="oldPassword"
            value={credenciales.oldPassword}
            onChange={handleChange}
            type="password"
            className="form-control"
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Nueva Contraseña</label>
          <input
            name="newPassword"
            value={credenciales.newPassword}
            onChange={handleChange}
            type="password"
            className="form-control"
            required
          />
        </div>
        <button type="submit" className="btn btn-primary w-100">Cambiar Contraseña</button>
      </form>
      {mensaje && <div className="alert alert-info mt-3">{mensaje}</div>}
    </div>
  );
};

export default CambiarPassword;