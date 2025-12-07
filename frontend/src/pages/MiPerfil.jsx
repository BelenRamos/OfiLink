import React from 'react';
import { useAuth } from '../hooks/useAuth';
import useMiPerfil from '../hooks/useMiPerfil';

// Componentes de presentación
import FotoPerfil from '../components/FotoPerfil';
import DetallesTrabajador from '../components/DetallesTrabajador';
import ListaContratacionesCliente from '../components/ListaContratacionesCliente';
import FormularioEditarPerfil from '../components/FormularioEditarPerfil';
import FormularioEditarTrabajador from '../components/FormularioEditarTrabajador';
import GenericConfirmModal from '../components/GenericConfirmModal';

const MiPerfil = () => {
  const authContext = useAuth();

  const {
    usuario,
    perfilTrabajador,
    contrataciones,
    mensaje,
    isEditing,
    isWorkerEditing,
    showDeleteModal,
    setIsEditing,
    setIsWorkerEditing,
    setShowDeleteModal,
    setPerfilTrabajador,
    handlePerfilUpdate,
    handleWorkerPerfilUpdate,
    handleFotoUpdate,
    handleEliminarCuenta,
    executeEliminarCuenta,
    puedeEditar,
    puedeVer,
    isLoadingAuth
  } = useMiPerfil(authContext);

  if (isLoadingAuth || !usuario) return null;

  if (!puedeVer) {
    return <h2 className="mt-5 text-center text-muted">🚫 No tienes permiso para ver tu perfil.</h2>;
  }

  return (
    <div className="container mt-5 mb-5">

      {/* Título principal */}
      <div className="text-center mb-4">
        <h2 className="fw-bold mb-1">Mi Perfil</h2>
        <p className="text-muted">Gestioná tus datos personales y profesionales</p>
      </div>

      {mensaje && (
        <div className="alert alert-info text-center shadow-sm">{mensaje}</div>
      )}

      {/* FOTO DE PERFIL */}
      <div className="d-flex justify-content-center mb-4">
        <FotoPerfil
          userId={usuario.id}
          currentFotoUrl={usuario.foto_url}
          onFotoUpdate={handleFotoUpdate}
          disabled={!puedeEditar}
        />
      </div>

      {/* DATOS PERSONALES */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-light d-flex justify-content-between align-items-center rounded-top">
          <h4 className="mb-0">
            <i className="bi bi-person-lines-fill me-2 text-primary"></i>Datos Personales
          </h4>
          <div>
            {puedeEditar && (
              <button
                className="btn btn-outline-primary btn-sm me-2"
                onClick={() => setIsEditing(prev => !prev)}
              >
                {isEditing ? 'Ocultar Edición' : 'Editar Datos'}
              </button>
            )}
            <button
              className="btn btn-outline-danger btn-sm"
              onClick={handleEliminarCuenta}
            >
              🗑️ Eliminar Cuenta
            </button>
          </div>
        </div>

        <div className="card-body">
          {isEditing && usuario && puedeEditar ? (
            <FormularioEditarPerfil
              usuario={usuario}
              onUpdate={handlePerfilUpdate}
              onCancel={() => setIsEditing(false)}
            />
          ) : (
            <div className="row">
              <div className="col-md-6 mb-2">
                <p><strong>👤 Nombre:</strong> {usuario.nombre}</p>
                <p><strong>📧 Email:</strong> {usuario.mail}</p>
                <p><strong>📞 Teléfono:</strong> {usuario.contacto || '(sin registrar)'}</p>
              </div>
              <div className="col-md-6 mb-2">
                <p><strong>🎂 Nacimiento:</strong> {usuario.fecha_nacimiento?.split('T')[0]}</p>
                <p><strong>🎭 Tipo de cuenta:</strong> {usuario.roles_keys?.join(', ')}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* DETALLES DE TRABAJADOR */}
      {usuario.roles_keys?.includes('trabajador') && (
        <div className="card shadow-sm border-0 mb-4">
          <div className="card-header bg-light d-flex justify-content-between align-items-center rounded-top">
            <h4 className="mb-0">
              <i className="bi bi-tools me-2 text-secondary"></i>Detalles de Trabajador
            </h4>
            {puedeEditar && (
              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={() => setIsWorkerEditing(prev => !prev)}
              >
                {isWorkerEditing ? 'Ocultar Edición' : 'Editar Oficios/Zonas'}
              </button>
            )}
          </div>
          <div className="card-body">
            {isWorkerEditing && perfilTrabajador && puedeEditar ? (
              <FormularioEditarTrabajador
                userId={usuario.id}
                perfilTrabajador={perfilTrabajador}
                onUpdate={handleWorkerPerfilUpdate}
                onCancel={() => setIsWorkerEditing(false)}
              />
            ) : (
              <DetallesTrabajador 
                perfilTrabajador={perfilTrabajador} 
                setPerfilTrabajador={setPerfilTrabajador}/>
            )}
          </div>
        </div>
      )}

      {/* CONTRATACIONES */}
      {usuario.roles_keys?.includes('cliente') && (
        <div className="card shadow-sm border-0 mb-4">
          <div className="card-header bg-light rounded-top">
            <h4 className="mb-0">
              <i className="bi bi-briefcase me-2 text-success"></i>Mis Contrataciones
            </h4>
          </div>
          <div className="card-body">
            <ListaContratacionesCliente contrataciones={contrataciones} />
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMACIÓN */}
      <GenericConfirmModal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={executeEliminarCuenta}
        title="Confirmar Eliminación de Cuenta"
        message={`¿Está ABSOLUTAMENTE seguro de eliminar su cuenta, ${usuario.nombre}? Esta acción no se puede deshacer sin contactar a un administrador.`}
        confirmText="Sí, Eliminar Mi Cuenta"
        confirmButtonClass="btn-danger"
      />
    </div>
  );
};

export default MiPerfil;
