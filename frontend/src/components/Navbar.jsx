import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logo from '../assets/logo1.png';
import './Navbar.css';

const Navbar = () => {
  const [usuario, setUsuario] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem('usuarioActual');
    setUsuario(stored ? JSON.parse(stored) : null);
  }, [location]);

  const logout = async () => {
    if (usuario?.token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${usuario.token}`,
            'Content-Type': 'application/json'
          }
        });
      } catch (err) {
        console.error('Error registrando logout:', err);
      }
    }

    // Limpiar localStorage y estado
    localStorage.removeItem('usuarioActual');
    setUsuario(null);

    // Redirigir al login
    navigate('/login');
  };

  const tieneRol = (...roles) => roles.some(r => usuario?.roles_keys?.includes(r));
  const esAdminOSupervisor = tieneRol('administrador', 'supervisor');

  return (
    <nav className="navbar navbar-expand-lg navbar-custom px-4 navbar-reducido">
      {esAdminOSupervisor ? (
        <span className="navbar-brand d-flex align-items-center">
          <img src={logo} alt="OfiLink logo" className="logo-img" />
        </span>
      ) : (
        <Link className="navbar-brand d-flex align-items-center" to="/home">
          <img src={logo} alt="OfiLink logo" className="logo-img" />
        </Link>
      )}

      <div className="collapse navbar-collapse">
        <ul className="navbar-nav ms-auto">
          {usuario ? (
            <>
              {tieneRol('cliente') && (
                <>
                  <li className="nav-item">
                    <Link className="nav-link" to="/buscar">Buscar</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/mi-perfil">Mi perfil</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/mis-contrataciones">Mis Contrataciones</Link>
                  </li>
                </>
              )}

              {tieneRol('trabajador') && (
                <li className="nav-item">
                  <Link className="nav-link" to="/mi-perfil">Mi perfil</Link>
                </li>
              )}

              <li className="nav-item">
                <button className="nav-link btn btn-link logout-btn" onClick={logout}>
                  Cerrar sesión
                </button>
              </li>
            </>
          ) : null}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
