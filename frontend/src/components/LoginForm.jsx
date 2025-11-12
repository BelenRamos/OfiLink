import React from 'react';
import logo from '../assets/logo1.png';

const LoginForm = ({
  credenciales,
  errorMensaje,
  loading,
  handleChange,
  handleLogin,
  navigate,
}) => {
  return (
    <div
      className="d-flex justify-content-center align-items-center vh-100"
      style={{ backgroundColor: 'rgb(245, 245, 245)' }}
    >
      <div
        className="card shadow-lg p-4 border-0"
        style={{
          width: '100%',
          maxWidth: '400px',
          borderRadius: '1.5rem',
        }}
      >
        <div className="text-center mb-4">
          <h3 className="fw-bold" style={{ color: 'rgb(45, 48, 53)' }}>
            Bienvenido a OfiLink
          </h3>
          <p className="text-muted mb-0">Conectamos personas, resolvemos problemas</p>
        </div>

        {/* Mensaje de error */}
        {errorMensaje && (
          <div className="alert alert-danger text-center py-2">{errorMensaje}</div>
        )}

        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label fw-semibold">Email</label>
            <input
              name="usuario"
              value={credenciales.usuario}
              onChange={handleChange}
              type="email"
              className="form-control shadow-sm"
              placeholder="ejemplo@mail.com"
              style={{ borderRadius: '10px' }}
            />
          </div>

          <div className="mb-4">
            <label className="form-label fw-semibold">Contraseña</label>
            <input
              name="password"
              value={credenciales.password}
              onChange={handleChange}
              type="password"
              className="form-control shadow-sm"
              placeholder="••••••••"
              style={{ borderRadius: '10px' }}
            />
          </div>

          <button
            type="submit"
            className="btn w-100 fw-semibold"
            style={{
              backgroundColor: 'rgb(205, 148, 193)',
              color: '#fff',
              borderRadius: '10px',
              transition: '0.3s',
            }}
            disabled={loading}
            onMouseOver={(e) => (e.target.style.backgroundColor = 'rgb(190, 130, 177)')}
            onMouseOut={(e) => (e.target.style.backgroundColor = 'rgb(205, 148, 193)')}
          >
            {loading ? 'Cargando...' : 'Ingresar'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <p className="mb-1 text-secondary">
            ¿No tienes una cuenta?{' '}
            <span
              className="fw-semibold"
              style={{
                color: 'rgb(212, 226, 113)',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
              onClick={() => navigate('/formularioRegistro')}
            >
              Regístrate aquí
            </span>
          </p>

          <p className="text-secondary">
            ¿Olvidaste tu contraseña?{' '}
            <span
              className="fw-semibold"
              style={{
                color: 'rgb(205, 148, 193)',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
              onClick={() => navigate('/cambiarPassword')}
            >
              Recuperarla
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
