import React from 'react';
import CardContratacion from '../components/CardContrataciones';
import { useAuth } from '../hooks/useAuth'; 
import useHome from '../hooks/useHome';

const extractErrorMessage = (error, defaultMessage) => {
  const errorBody = error.response || {};
  const errorMessage = errorBody.error || defaultMessage;
  return errorMessage + (errorBody.details ? ` (${errorBody.details})` : '');
};

const Home = () => {
  const { usuario, tienePermiso, tieneRol } = useAuth();

  const {
    contratacionesMostradas,
    mensaje,
    filtroEstado,
    setFiltroEstado,
    cargarContrataciones,
    permisosTarjeta,
    estadosContratacion,
  } = useHome({ usuario, tienePermiso, tieneRol }, extractErrorMessage);

  if (!tienePermiso("ver_home")) {
    return (
      <div className="container mt-5 text-center">
        <h2 className="text-danger">No tienes permiso para acceder al Home</h2>
      </div>
    );
  }

  return (
    <div className="container py-5">
      {/* Encabezado */}
      <div className="text-center mb-4">
        <h2 className="fw-bold mb-1" style={{ color: 'rgb(45, 48, 53)' }}>
          ¡Hola <span style={{ color: 'rgb(205, 148, 193)' }}>{usuario.nombre}</span>!
        </h2>
        <p className="text-secondary">Bienvenido/a a tu espacio en OfiLink</p>
      </div>

      {mensaje && (
        <div className="alert alert-info text-center shadow-sm">{mensaje}</div>
      )}

      {/* Filtro visible solo para trabajadores */}
      {tieneRol('trabajador') && (
        <div
          className="p-3 mb-4 rounded-4 d-flex flex-wrap align-items-center justify-content-center gap-2"
          style={{
            backgroundColor: 'rgba(205, 148, 193, 0.15)',
            border: '1px solid rgba(205, 148, 193, 0.3)',
          }}
        >
          <label
            htmlFor="filtroEstado"
            className="form-label fw-semibold mb-0"
            style={{ color: 'rgb(45, 48, 53)' }}
          >
            Filtrar por estado:
          </label>
          <select
            id="filtroEstado"
            className="form-select w-auto shadow-sm border-0 fw-semibold"
            style={{
              backgroundColor: 'rgb(212, 226, 113)',
              color: 'rgb(45, 48, 53)',
              cursor: 'pointer',
              borderRadius: '10px',
            }}
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
          >
            {estadosContratacion.map((estado) => (
              <option key={estado} value={estado}>
                {estado}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Sin contrataciones */}
      {contratacionesMostradas.length === 0 && !mensaje && (
        <p className="text-center text-muted mt-3">
          ¡No tienes contrataciones{' '}
          {tieneRol('cliente') ? 'en curso' : `en estado: ${filtroEstado}`}!
        </p>
      )}

      {/* Cards de contrataciones */}
      <div className="row">
        {contratacionesMostradas.map((c) => (
          <div key={c.id} className="col-md-6 col-lg-4 mb-4">
            <CardContratacion
              contratacion={c}
              usuario={usuario}
              onActualizar={cargarContrataciones}
              permisos={permisosTarjeta}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
