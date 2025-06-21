import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary px-4">
      <Link className="navbar-brand" to="/">OfiLink</Link>
      <div className="collapse navbar-collapse">
        <ul className="navbar-nav ms-auto">
          <li className="nav-item">
            <Link className="nav-link" to="/buscar">Buscar</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/login">Ingresar</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/registro">Registrarse</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
