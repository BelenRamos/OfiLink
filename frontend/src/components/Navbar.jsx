import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../assets/logo1.png';
import './Navbar.css';

const Navbar = () => {
  const [usuario, setUsuario] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const stored = localStorage.getItem('usuarioActual');
    setUsuario(stored ? JSON.parse(stored) : null);
  }, [location]);

  const logout = () => {
    localStorage.removeItem('usuarioActual');
    setUsuario(null);
    window.location.href = '/';
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-custom px-4 navbar-reducido">

      <Link className="navbar-brand d-flex align-items-center" to="/home">
        <img src={logo} alt="OfiLink logo" className="logo-img" />
      </Link>


      <div className="collapse navbar-collapse">
        <ul className="navbar-nav ms-auto">
          {/* Si hay usuario, mostramos las opciones */}
          {usuario ? (
            <>
              <li className="nav-item">
                <Link className="nav-link" to="/buscar">Buscar</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/mi-perfil">Mi perfil</Link>
              </li>

              {(usuario.tipo === 'admin' || usuario.tipo === 'supervisor') && (
                <li className="nav-item">
                  <Link className="nav-link" to="/admin">Admin</Link>
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
