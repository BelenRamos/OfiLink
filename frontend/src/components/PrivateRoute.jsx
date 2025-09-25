import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth'; // 👈 Usar la fuente de verdad

const PrivateRoute = ({ children, allowedRoles }) => {
  // Se obtiene la data del Contexto, NO de localStorage
  const { usuario, tieneRol, isLoading } = useAuth();
  const location = useLocation();

  // Se espera la carga. Si AuthProvider no ha decidido, muestra un loader.
  if (isLoading) {
    return (
      <div className="d-flex justify-content-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  //Redirección si NO está logueado
  if (!usuario) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  //Verificación de Roles (Usando la función del Contexto)
  if (allowedRoles) {
      // ¿Tiene almenos uno de los roles permitidos?
      if (!tieneRol(...allowedRoles)) { 
          // No tiene el rol necesario
          return <Navigate to="/" replace />;
      }
  }

  return children;
};

export default PrivateRoute;