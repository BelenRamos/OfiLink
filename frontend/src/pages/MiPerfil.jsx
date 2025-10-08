import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../utils/apiFetch';

// Componentes Reutilizados
import FotoPerfil from '../components/FotoPerfil';
import DetallesTrabajador from '../components/DetallesTrabajador'; 
import ListaContratacionesCliente from '../components/ListaContratacionesCliente';

// Nuevos Componentes de Edición
import FormularioEditarPerfil from '../components/FormularioEditarPerfil'; 
import FormularioEditarTrabajador from '../components/FormularioEditarTrabajador';

const MiPerfil = () => {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [perfilTrabajador, setPerfilTrabajador] = useState(null);
  const [contrataciones, setContrataciones] = useState([]);
  
  // Estados para controlar la visualización de los formularios de edición
  const [isEditing, setIsEditing] = useState(false); // Edición de datos básicos (Nombre, Contacto)
  const [isWorkerEditing, setIsWorkerEditing] = useState(false); // Edición de perfil de trabajador (Oficios, Zonas)

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
    
    // Ocultar el formulario después de la actualización exitosa
    setIsEditing(false);
  };
  
  // 2. Manejo de Actualización de Perfil de Trabajador
  const handleWorkerPerfilUpdate = (datosActualizados) => {
    setPerfilTrabajador(datosActualizados);
    // Ocultar el formulario después de la actualización exitosa
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
  };

  // 4. Carga Inicial de Datos (se mantiene la lógica original)
  useEffect(() => {
    const cargarDatos = async () => {
      const usuarioGuardado = localStorage.getItem('usuarioActual');
      if (!usuarioGuardado) {
        navigate('/login');
        return;
      }

      const parsedUsuario = JSON.parse(usuarioGuardado);

      try {
        const dataPersona = await apiFetch(`/api/personas/${parsedUsuario.id}`);
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
      }
    };

    cargarDatos();
  }, [navigate]);

  if (!usuario) return null;

  return (
    <div className="container mt-4">
      <h2>Mi Perfil</h2>
      <hr />
      
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
            <button 
                className="btn btn-outline-primary btn-sm" 
                onClick={() => setIsEditing(prev => !prev)} // Alternar edición
            >
                {isEditing ? 'Ocultar Edición' : 'Editar Datos'}
            </button>
        </div>
        
        {isEditing && usuario ? (
            // Muestra el formulario si isEditing es true
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
                    onClick={() => setIsWorkerEditing(prev => !prev)} // Alternar edición
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
                // Muestra la vista de detalles del trabajador
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
        <ListaContratacionesCliente contrataciones={contrataciones} />
      )}
    </div>
  );
};

export default MiPerfil;