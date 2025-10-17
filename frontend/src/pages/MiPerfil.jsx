import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../utils/apiFetch';
import { useAuth } from '../hooks/useAuth';
import FotoPerfil from '../components/FotoPerfil';
import DetallesTrabajador from '../components/DetallesTrabajador'; 
import ListaContratacionesCliente from '../components/ListaContratacionesCliente';
import FormularioEditarPerfil from '../components/FormularioEditarPerfil'; 
import FormularioEditarTrabajador from '../components/FormularioEditarTrabajador';
import GenericConfirmModal from '../components/GenericConfirmModal';

const MiPerfil = () => {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [perfilTrabajador, setPerfilTrabajador] = useState(null);
  const [contrataciones, setContrataciones] = useState([]);
  const [mensaje, setMensaje] = useState(''); 
  const { usuario: usuarioContext, logoutUser } = useAuth();
  
  // Estados para controlar la visualización de los formularios de edición
  const [isEditing, setIsEditing] = useState(false); 
  const [isWorkerEditing, setIsWorkerEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false); 
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // 1. Manejo de Actualización de Datos Básicos
  const handlePerfilUpdate = (datosActualizados) => {
    // Fusionar los datos actualizados con los existentes
    const nuevoUsuario = { 
        ...usuario, 
        ...datosActualizados 
    };
    
    setUsuario(nuevoUsuario);
    // Actualizar también en localStorage para persistencia de sesión
    localStorage.setItem('usuarioActual', JSON.stringify(nuevoUsuario));
    setMensaje('¡Perfil actualizado con éxito!');
    
    setIsEditing(false);
  };
  
  // 2. Manejo de Actualización de Perfil de Trabajador
  const handleWorkerPerfilUpdate = (datosActualizados) => {
    setPerfilTrabajador(datosActualizados);
    setMensaje('¡Perfil de trabajador actualizado con éxito!');
    setIsWorkerEditing(false); 
  };
  
  // 3. Manejo de Actualización de Foto (se mantiene la lógica original)
  const handleFotoUpdate = (nuevaUrl) => {
    setUsuario(prevUsuario => {
      const nuevoUsuario = { ...prevUsuario, foto_url: nuevaUrl };
      localStorage.setItem('usuarioActual', JSON.stringify(nuevoUsuario));
      return nuevoUsuario;
    });
    
    if (perfilTrabajador) {
      setPerfilTrabajador(prevPerfil => ({
        ...prevPerfil,
        foto_url: nuevaUrl
      }));
    }
    setMensaje('¡Foto de perfil actualizada!');
  };

// 4. Funcion para ELIMINAR CUENTA (AHORA SOLO ABRE EL MODAL)
const handleEliminarCuenta = () => {
    // Si la cuenta ya se está eliminando o no hay usuario, salir.
    if (!usuario || !usuario.id || isDeleting) return; 

    setShowDeleteModal(true);
};

const executeEliminarCuenta = async () => {
    setShowDeleteModal(false);
    setIsDeleting(true); 

    try {
        await apiFetch(`/api/personas/mi-perfil/eliminar`, { 
            method: 'PUT',
            body: { 
                motivo: "Eliminación de cuenta por el propio usuario"
            }
        });
        
        await logoutUser(); 
        setMensaje('Su cuenta ha sido eliminada exitosamente. Redirigiendo...');
    
    } catch (error) {
        console.error('Error al eliminar la cuenta:', error);
        setMensaje(`Error al eliminar la cuenta: ${error.message || 'Error de conexión.'}`);
        setIsDeleting(false); 
    }
};

  // 5. Carga Inicial de Datos
  useEffect(() => {
    if (isDeleting) {
      // El useEffect ignora la falta de usuario si isDeleting es true
      return; 
    }

    if (!usuarioContext) {
      const usuarioGuardado = localStorage.getItem('usuarioActual');
      if (!usuarioGuardado) {
        navigate('/login'); 
        return;
      }
    }
    
    const parsedUsuario = usuarioContext || JSON.parse(localStorage.getItem('usuarioActual'));
    
    const cargarDatos = async () => {
      try {
        const dataPersona = await apiFetch(`/api/personas/${parsedUsuario.id}`);
        if (dataPersona.estado_cuenta === 'Eliminado') {
          logoutUser(); 
          setMensaje("Su cuenta ha sido marcada como eliminada. Contacte a un administrador para reactivarla.");
          setTimeout(() => {
            navigate('/login');
          }, 3000);
          return;
        }
        
        const usuarioActualizado = {
            ...parsedUsuario, 
            ...dataPersona, 
            roles_keys: parsedUsuario.roles_keys
        };

        setUsuario(usuarioActualizado);
        localStorage.setItem('usuarioActual', JSON.stringify(usuarioActualizado)); 

        if (usuarioActualizado.roles_keys?.includes('trabajador')) {
          const dataTrabajador = await apiFetch(`/api/trabajadores/${usuarioActualizado.id}`);
          setPerfilTrabajador(dataTrabajador); 
        }

        if (parsedUsuario.roles_keys?.includes('cliente')) {
          const dataContrataciones = await apiFetch('/api/contrataciones');
          setContrataciones(dataContrataciones);
        }
      } catch (err) {
        console.error('Error cargando datos:', err);
        setMensaje('Error al cargar los datos del perfil.');
      }
    };

    if (parsedUsuario) {
      cargarDatos();
    }
  }, [navigate, usuarioContext, logoutUser, isDeleting]);

  if (!usuario) return null;

  return (
    <div className="container mt-4">
      <h2>Mi Perfil</h2>
      <hr />
      {mensaje && <div className="alert alert-info">{mensaje}</div>} 
      
      {/* Foto de Perfil (siempre visible) */}
      <FotoPerfil
        userId={usuario.id}
        currentFotoUrl={usuario.foto_url} 
        onFotoUpdate={handleFotoUpdate}
      />
      
      {/* ------------------------------------------------------------- */}
      {/* 1. SECCIÓN DE DATOS BÁSICOS */}
      <div className="card p-3 mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="mb-0">Datos Personales</h4>
            <div>
                <button 
                    className="btn btn-outline-primary btn-sm me-2" 
                    onClick={() => setIsEditing(prev => !prev)} // Alternar edición
                >
                    {isEditing ? 'Ocultar Edición' : 'Editar Datos'}
                </button>
                
                {/* BOTÓN DE ELIMINAR CUENTA*/}
                <button
                    className="btn btn-danger btn-sm"
                    onClick={handleEliminarCuenta}
                >
                    🗑️ Eliminar Mi Cuenta
                </button>
            </div>
        </div>
        
        {isEditing && usuario ? (
            <FormularioEditarPerfil
                usuario={usuario}
                onUpdate={handlePerfilUpdate}
                onCancel={() => setIsEditing(false)}
            />
        ) : (
            // Muestra la información si isEditing es false
            <div>
                <p><strong>Nombre:</strong> {usuario.nombre}</p>
                <p><strong>Email:</strong> {usuario.mail}</p> {/* Email no editable */}
                <p><strong>Teléfono:</strong> {usuario.contacto || '(a completar)'}</p>
                <p><strong>Nacimiento:</strong> {usuario.fecha_nacimiento?.split('T')[0]}</p>
                <p><strong>Rol:</strong> {usuario.roles_keys?.join(', ')}</p>
            </div>
        )}
      </div>
      
      {/* ------------------------------------------------------------- */}
      {/* 2. SECCIÓN DE DETALLES DEL TRABAJADOR */}
      {usuario.roles_keys?.includes('trabajador') && (
        <div className="card p-3 mb-4">
            <div className="d-flex justify-content-between align-items-center">
                <h4 className="mb-3">Detalles de Trabajador</h4>
                <button 
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => setIsWorkerEditing(prev => !prev)}
                >
                    {isWorkerEditing ? 'Ocultar Edición' : 'Editar Oficios/Zonas'}
                </button>
            </div>
            
            {isWorkerEditing && perfilTrabajador ? (
                // Muestra el formulario de trabajador si isWorkerEditing es true
                <FormularioEditarTrabajador
                    userId={usuario.id}
                    perfilTrabajador={perfilTrabajador}
                    onUpdate={handleWorkerPerfilUpdate}
                    onCancel={() => setIsWorkerEditing(false)}
                />
            ) : (
                <DetallesTrabajador 
                    perfilTrabajador={perfilTrabajador} 
                    setPerfilTrabajador={setPerfilTrabajador}
                />
            )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. SECCIÓN DE CONTRATACIONES DE CLIENTE */}
      {usuario.roles_keys?.includes('cliente') && (
        <ListaContratacionesCliente 
            contrataciones={contrataciones} 
            setContrataciones={setContrataciones}
        />
      )}

      {/* MODAL DE CONFIRMACIÓN DE ELIMINACIÓN */}
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
