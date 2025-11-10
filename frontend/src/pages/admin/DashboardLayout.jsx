import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Dashboard from './Dashboard';
import Usuarios from './Usuarios';
import Contrataciones from './Contrataciones';
import Reporte from './Reporte';
import Seguridad from './seguridad/Seguridad';
import Denuncias from './Denuncias';
import Oficios from './Oficios';

const DashboardLayout = () => {
  return (
    <div className="container mt-4">
      <h2>Seguridad de OfiLink</h2>
      <hr />

      <div className="row">
        <div className="col-md-3">
          {/* Menú lateral */}
          <ul className="list-group">
            <li className="list-group-item"><Link to="">Inicio</Link></li>
            <li className="list-group-item"><Link to="usuarios">Usuarios</Link></li>
            <li className="list-group-item"><Link to="contrataciones">Contrataciones</Link></li>
            <li className="list-group-item"><Link to="oficios">Oficios</Link></li>
            <li className="list-group-item"><Link to="reportes">Reportes</Link></li>
            <li className="list-group-item"><Link to="denuncias">Denuncias</Link></li> 
            <li className="list-group-item"><Link to="seguridad">Seguridad</Link></li>
          </ul>
        </div>

        <div className="col-md-9">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="usuarios" element={<Usuarios />} />
            <Route path="contrataciones" element={<Contrataciones />} />
            <Route path="oficios" element={<Oficios />} />
            <Route path="reportes" element={<Reporte />} />
            <Route path="denuncias" element={<Denuncias />} />
            <Route path="seguridad/*" element={<Seguridad />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
