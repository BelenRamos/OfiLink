import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children, allowedRoles }) => {
  const usuario = JSON.parse(localStorage.getItem('usuarioActual'));

  if (!usuario) return <Navigate to="/login" replace />;

  // allowedRoles y roles_keys están en minúscula para comparación
  const userRoles = usuario.roles_keys || [];
  const hasAccess = allowedRoles
    ? allowedRoles.some(role => userRoles.includes(role.toLowerCase()))
    : true;

  if (!hasAccess) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute;
