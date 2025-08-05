import { Link } from 'react-router-dom';

const Navbar = () => {
  const usuario = JSON.parse(localStorage.getItem('usuarioLogueado'));

  const logout = () => {
    localStorage.removeItem('usuarioLogueado');
    window.location.href = '/';
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary px-4">
      <Link className="navbar-brand" to="/">OfiLink</Link>
      <div className="collapse navbar-collapse">
        <ul className="navbar-nav ms-auto">


          {!usuario && (
            <>
              <li className="nav-item">
                <Link className="nav-link" to="/login">Ingresar</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/registro">Registrarse</Link>
              </li>

            </>
          )}

          {usuario && (
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
                <button className="nav-link btn btn-link text-white" onClick={logout}>Cerrar sesión</button>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
