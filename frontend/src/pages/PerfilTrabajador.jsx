import React from 'react';
import { useNavigate } from 'react-router-dom';
import FormularioContratacion from '../components/FormularioContratacion';
import DenunciaModal from "../components/DenunciaModal";
import { useAuth } from "../hooks/useAuth";
import usePerfilTrabajador from '../hooks/usePerfilTrabajador'; 

const DEFAULT_AVATAR = '/default-avatar.png'; 

const PerfilTrabajador = () => {
    const navigate = useNavigate();
    const { usuario: usuarioContext, tienePermiso, tieneRol } = useAuth(); 
    
    // Usar el hook para obtener toda la lógica y estados
    const {
        trabajador,
        reseñas,
        loading,
        mensajeFeedback,
        mostrarDenuncia,
        mostrandoFormulario,
        usuario,
        handleContratacionExitosa,
        handleDenunciaExitosa,
        handleAbrirFormulario,
        handleCerrarFormulario,
        handleAbrirDenuncia,
        handleCerrarDenuncia,
        fotoUrl, 
        calificacion_promedio 
    } = usePerfilTrabajador(usuarioContext);

    const PERMISO_DENUNCIAR = 'denunciar_trabajador'; 
    
    const puedeContratar = tieneRol('cliente');
    const puedeDenunciar = tieneRol('cliente') && tienePermiso(PERMISO_DENUNCIAR);
    const alertClass = mensajeFeedback.tipo === 'success' ? 'alert-success' : 'alert-danger';

    if (loading) return <div className="container mt-4 text-center">Cargando...</div>;

    if (!trabajador)
        return (
            <div className="container mt-4">
                <div className="alert alert-danger">Trabajador no encontrado.</div>
            </div>
        );

    return (
        <div className="container mt-4">

            <button className="btn btn-outline-secondary mb-3" onClick={() => navigate(-1)}>
                ← Volver
            </button>

            {mensajeFeedback.mensaje && (
                <div className={`alert ${alertClass} mb-4 text-center fw-bold`}>
                    {mensajeFeedback.mensaje}
                </div>
            )}
      <div className="card shadow-sm p-4 mb-4">
        <div className="d-flex flex-column flex-md-row align-items-center">

          <img
            src={fotoUrl}
            alt={trabajador.nombre}
            className="rounded-circle border mb-3 mb-md-0"
            style={{ width: 120, height: 120, objectFit: 'cover' }}
          />

          <div className="ms-md-4 text-center text-md-start">
            <h2 className="fw-bold">{trabajador.nombre}</h2>

            {calificacion_promedio !== null && (
              <p className="mb-1">
                ⭐ <strong>{parseFloat(calificacion_promedio)}</strong> / 5
              </p>
            )}

            <h5 className="text-muted mb-2">
              {trabajador.oficios?.join(', ')} • {trabajador.zona}
            </h5>

            <p>{trabajador.descripcion}</p>

            <p>
              <strong>📞 Teléfono:</strong>{' '}
              <a href={`tel:${trabajador.contacto}`} className="text-decoration-none fw-bold">
                {trabajador.contacto}
              </a>
            </p>

          {puedeContratar && trabajador.disponible && (
            mostrandoFormulario ? (
                <FormularioContratacion
                    idTrabajador={trabajador.id}
                    onCancel={handleCerrarFormulario} // Handler del hook
                    onSuccess={handleContratacionExitosa} // Handler del hook
                />
            ) : (
                <button className="btn btn-primary me-2 mt-2" onClick={handleAbrirFormulario}>
                    📌 Contratar
                </button>
            )
         )}

          {puedeDenunciar && (
              <button className="btn btn-outline-danger mt-2" onClick={handleAbrirDenuncia}>
                  ⚠️ Denunciar
              </button>
          )}
          </div>
        </div>
        </div>
            <DenunciaModal
                show={mostrarDenuncia}
                onHide={handleCerrarDenuncia} // Handler del hook
                trabajadorId={trabajador.id}
                usuario={usuario}
                onDenunciaCreada={handleDenunciaExitosa} // Handler del hook
            />

      <h3 className="mb-3">Reseñas</h3>

      {reseñas.length === 0 ? (
        <div className="alert alert-info">No hay reseñas para este trabajador aún.</div>
      ) : (
        <div className="list-group">
          {reseñas.map(r => (
            <div key={r.id} className="list-group-item py-3">
              <strong>{r.nombre_cliente}</strong>
              <div className="text-warning">⭐ {r.puntuacion}</div>
              <p className="mb-0">{r.comentario}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PerfilTrabajador;
