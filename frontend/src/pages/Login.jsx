import React from 'react';

const Login = () => {
  return (
    <div className="container mt-4" style={{ maxWidth: '400px' }}>
      <h2 className="mb-4">Ingresar</h2>
      <form>
        <div className="mb-3">
          <label className="form-label">Teléfono o Email</label>
          <input type="text" className="form-control" placeholder="Ej: 1123456789" />
        </div>
        <div className="mb-3">
          <label className="form-label">Contraseña</label>
          <input type="password" className="form-control" />
        </div>
        <button type="submit" className="btn btn-primary w-100">Ingresar</button>
      </form>
    </div>
  );
};

export default Login;
