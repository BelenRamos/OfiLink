import React from 'react';
import CardTrabajador from '../components/CardTrabajador';
import FiltroTrabajadores from '../components/FiltroTrabajadores';
import { useAuth } from '../hooks/useAuth';
import useBuscarTrabajadores from '../hooks/useBuscar'; 

const Buscar = () => {
  const { tienePermiso } = useAuth();
  const PERMISO_VER_BUSCAR = 'ver_buscar';

  const { 
    trabajadores,
    loading,
    error,
    oficio,
    setOficio,
    zona,
    setZona,
    calificacion,
    setCalificacion,
  } = useBuscarTrabajadores(tienePermiso, PERMISO_VER_BUSCAR);

  return (
    <div className="container py-4">
      {/* Encabezado */}
      <div className="text-center mb-4">
        <h2 className="fw-bold" style={{ color: 'rgb(45, 48, 53)' }}>
          Buscar <span style={{ color: 'rgb(205, 148, 193)' }}>Trabajadores</span>
        </h2>
        <p style={{ color: '#555' }}>
          Filtra por oficio, zona o calificación para encontrar el profesional ideal.
        </p>
      </div>

      {/* Filtros */}
      <div
        className="p-4 mb-4 rounded-4 shadow-sm"
        style={{
          backgroundColor: 'white',
          border: '1px solid #eee',
        }}
      >
        <FiltroTrabajadores 
          oficio={oficio} 
          setOficio={setOficio} 
          zona={zona} 
          setZona={setZona}
          calificacion={calificacion} 
          setCalificacion={setCalificacion} 
        />
      </div>

      {/* Resultados */}
      <div className="row">
        {loading && (
          <div className="text-center my-5">
            <div
              className="spinner-border"
              role="status"
              style={{ color: 'rgb(205, 148, 193)' }}
            ></div>
            <p className="mt-3 text-muted">Cargando trabajadores...</p>
          </div>
        )}

        {error && (
          <p className="alert alert-danger text-center">Error: {error}</p>
        )}

        {!loading && !error && trabajadores.length > 0 && (
          trabajadores.map(trabajador => (
            <div key={trabajador.id} className="col-md-6 col-lg-4 mb-4">
              <CardTrabajador trabajador={trabajador} />
            </div>
          ))
        )}

        {!loading && !error && trabajadores.length === 0 && (
          <p className="text-center text-muted mt-4">
            No se encontraron trabajadores para esos filtros.
          </p>
        )}
      </div>
    </div>
  );
};

export default Buscar;
