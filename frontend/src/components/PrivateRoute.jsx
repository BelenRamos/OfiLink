import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children, allowedRoles }) => {
  const usuario = JSON.parse(localStorage.getItem('usuarioActual'));

  if (!usuario) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(usuario.tipo)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute;