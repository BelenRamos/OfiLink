import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [credenciales, setCredenciales] = useState({ usuario: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredenciales({ ...credenciales, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credenciales),
      });

      if (!res.ok) throw new Error('Error de login');

      const usuario = await res.json();
      localStorage.setItem('usuarioActual', JSON.stringify(usuario));
      navigate('/mi-perfil');
    } catch (err) {
      alert('Credenciales incorrectas');
    }
  };

  return (
    <div className="container mt-4" style={{ maxWidth: '400px' }}>
      <h2 className="mb-4">Ingresar</h2>
      <form onSubmit={handleLogin}>
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input
            name="usuario"
            value={credenciales.usuario}
            onChange={handleChange}
            type="text"
            className="form-control"
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Contraseña</label>
          <input
            name="password"
            value={credenciales.password}
            onChange={handleChange}
            type="password"
            className="form-control"
          />
{/*           <input
            name="password"
            type="password"
            className="form-control"
            autoComplete="current-password"
            value={credenciales.password}
            onChange={handleChange}
          /> */}
        </div>
        <button type="submit" className="btn btn-primary w-100">Ingresar</button>
      </form>
    </div>
  );
};

export default Login;