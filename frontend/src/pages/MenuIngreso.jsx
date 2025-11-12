import { Link } from 'react-router-dom';
import React from 'react';

const MenuIngreso = () => {
  return (
    <div className="container text-center mt-5">
      <div className="p-5 rounded-4 shadow-sm" style={{ backgroundColor: 'rgb(45, 48, 53)', color: 'white' }}>
        <h1 className="fw-bold mb-3" style={{ color: 'rgb(212, 226, 113)' }}>
          Bienvenido a <span style={{ color: 'rgb(205, 148, 193)' }}>OfiLink</span>
        </h1>
        <p className="lead mb-4 text-light">
          Conectamos personas, resolvemos problemas.
        </p>

        <div className="d-flex justify-content-center gap-3 flex-wrap">
          <Link
            to="/formularioRegistro"
            className="btn px-4 py-2 fw-semibold shadow-sm"
            style={{
              backgroundColor: 'rgb(212, 226, 113)',
              color: 'rgb(45, 48, 53)',
              border: 'none',
              transition: 'all 0.2s ease-in-out'
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = 'rgb(205, 148, 193)')}
            onMouseLeave={(e) => (e.target.style.backgroundColor = 'rgb(212, 226, 113)')}
          >
            Registrarse
          </Link>

          <Link
            to="/login"
            className="btn px-4 py-2 fw-semibold shadow-sm"
            style={{
              backgroundColor: 'transparent',
              color: 'rgb(205, 148, 193)',
              border: '2px solid rgb(205, 148, 193)',
              transition: 'all 0.2s ease-in-out'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'rgb(205, 148, 193)';
              e.target.style.color = 'rgb(45, 48, 53)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = 'rgb(205, 148, 193)';
            }}
          >
            Ingresar
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MenuIngreso;
