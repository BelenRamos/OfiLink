import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../utils/apiFetch';

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

      if (!res.ok) throw new Error('Credenciales incorrectas');

      const { usuario, token } = await res.json();

      const usuarioNormalizado = {
        id: usuario.id,
        nombre: usuario.nombre,
        mail: usuario.mail,
        grupo: usuario.grupo,
        roles: usuario.roles || [],
        roles_keys: usuario.roles_keys || [],
        token
      };

      localStorage.setItem('usuarioActual', JSON.stringify(usuarioNormalizado));

      if (usuarioNormalizado.roles_keys.includes('administrador') || usuarioNormalizado.roles_keys.includes('supervisor')) {
        navigate('/admin');
      } else {
        navigate('/home');
      }
    } catch (err) {
      alert(err.message);
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
        </div>
            <button type="submit" className="btn btn-primary w-100">Ingresar</button>
          </form>
      <div className="mt-3 text-center">
        <p className="text-primary" style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => navigate('/formularioRegistro')}>
          ¿No tienes una cuenta? Regístrate
        </p>
        <p className="text-primary mt-2" style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => navigate('/cambiarPassword')}>
          ¿Quieres cambiar tu contraseña? Has click aquí
        </p>
      </div>
    </div>
  );
};

export default Login;