import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../utils/apiFetch';
import FotoPerfil from '../components/FotoPerfil';
import DetallesTrabajador from '../components/DetallesTrabajador'; 
import ListaContratacionesCliente from '../components/ListaContratacionesCliente';

const MiPerfil = () => {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [perfilTrabajador, setPerfilTrabajador] = useState(null);
  const [contrataciones, setContrataciones] = useState([]);
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
      
      <FotoPerfil
        userId={usuario.id}
        currentFotoUrl={usuario.foto_url} 
        onFotoUpdate={handleFotoUpdate}
      />

      {/*Información Básica del Usuario */}
      <p><strong>Nombre:</strong> {usuario.nombre}</p>
      <p><strong>Email:</strong> {usuario.mail}</p>
      <p><strong>Rol:</strong> {usuario.roles_keys?.join(', ')}</p>

      {/*Detalles del Trabajador*/}
      {usuario.roles_keys?.includes('trabajador') && (
        <DetallesTrabajador 
          perfilTrabajador={perfilTrabajador} 
          setPerfilTrabajador={setPerfilTrabajador}
        />
      )}

      {/* Lista de Contrataciones */}
      {usuario.roles_keys?.includes('cliente') && (
        <ListaContratacionesCliente contrataciones={contrataciones} />
      )}
    </div>
  );
};

export default MiPerfil;