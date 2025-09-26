import React, { useEffect, useState } from 'react';
import { apiFetch } from '../utils/apiFetch';
import CardContratacion from '../components/CardContrataciones';
import { useAuth } from '../hooks/useAuth'; 

const Home = () => {
  //Se obtiene toda la info y las funciones del Contexto
  const { usuario, tienePermiso, tieneRol } = useAuth();
  
  // Mantenemos solo el estado local necesario
  const [contrataciones, setContrataciones] = useState([]);

  // Si el usuario es null (ej: no logueado), la PrivateRoute ya se encargó de redirigir.
  // Por precaución, siempre verifica si 'usuario' existe antes de usarlo.

  const cargarContrataciones = async () => {
    if (!usuario) return; 

    try {
      // Si la API de contrataciones requiere un token, 'apiFetch' debe estar configurado para adjuntar automáticamente el token de 'usuario.token'.
      const data = await apiFetch('/api/contrataciones');
      setContrataciones(data);
    } catch (error) {
      console.error(error);
      alert('Error al cargar contrataciones');
    }
  };

  useEffect(() => {
    if (usuario) {
      cargarContrataciones();
    }
  }, [usuario]); 

  // --- Lógica de Renderizado y Permisos ---
  //Verificación de permisos
  if (!tienePermiso("ver_home")) {
     // Si la PrivateRoute no maneja el rol/permiso específico, se muestra el error aquí.
     return <h2 className="mt-4">No tienes permiso para acceder al Home</h2>;
  }

  const permisosTarjeta = {
    aceptar: !!tienePermiso('contratacion_aceptar'),
    cancelar: !!tienePermiso('contratacion_cancelar'),
    resenar: !!tienePermiso('contratacion_resenar'),
    terminar: !!tienePermiso('contratacion_terminar'),
  };

  //Filtrado de Contrataciones: Usamos la función tieneRol del Contexto
  let contratacionesMostradas = contrataciones;
  if (tieneRol('cliente')) {
    contratacionesMostradas = contrataciones.filter(c => c.estado === 'En curso');
  }

  // 📢 Opcional, pero útil para confirmar
  console.log("Home: Permiso Terminar que se enviará:", permisosTarjeta.terminar);


  return (
    <div className="container mt-4">
      {/* Usamos directamente el objeto 'usuario' del contexto */}
      <h2>Bienvenido, {usuario.nombre}</h2>

      {contratacionesMostradas.length === 0 && (
        <p>¡No tienes contrataciones en curso!</p>
      )}

      {contratacionesMostradas.map(c => (
        <CardContratacion
          key={c.id}
          contratacion={c}
          usuario={usuario}
          onActualizar={cargarContrataciones}
          permisos={permisosTarjeta}
        />
      ))}
    </div>
  );
};

export default Home;