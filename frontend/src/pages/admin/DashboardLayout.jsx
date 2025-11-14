import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './Dashboard';
import Usuarios from './Usuarios';
import Contrataciones from './Contrataciones';
import Reporte from './Reporte';
import Seguridad from './seguridad/Seguridad';
import Denuncias from './Denuncias';
import Oficios from './Oficios';

const DashboardLayout = () => {
  const location = useLocation();

  const menuItems = [
    { path: '', label: 'Inicio' },
    { path: 'usuarios', label: 'Usuarios' },
    { path: 'contrataciones', label: 'Contrataciones' },
    { path: 'oficios', label: 'Oficios' },
    { path: 'reportes', label: 'Reportes' },
    { path: 'denuncias', label: 'Denuncias' },
    { path: 'seguridad', label: 'Seguridad' },
  ];

  return (
    <div className="container-fluid py-4">
      <div className="row">
        {/* Menú lateral */}
        <aside className="col-md-3 col-lg-2 mb-4">
          <div
            className="p-3 rounded-4 shadow-sm"
            style={{
              backgroundColor: 'rgb(45, 48, 53)',
              color: 'white',
            }}
          >
            <h4 className="mb-3 text-center" style={{ color: 'rgb(212, 226, 113)' }}>
              Panel de OfiLink
            </h4>
            <ul className="list-unstyled">
              {menuItems.map((item) => {
                const isActive =
                  location.pathname === `/admin/${item.path}` ||
                  (item.path === '' && location.pathname === '/admin');
                return (
                  <li key={item.path} className="mb-2">
                    <Link
                      to={item.path}
                      className="d-block px-3 py-2 rounded-3 fw-semibold text-decoration-none"
                      style={{
                        backgroundColor: isActive ? 'rgb(205, 148, 193)' : 'transparent',
                        color: isActive ? 'rgb(45, 48, 53)' : 'white',
                        transition: 'all 0.3s ease',
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) e.target.style.backgroundColor = 'rgba(205, 148, 193, 0.3)';
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) e.target.style.backgroundColor = 'transparent';
                      }}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>

        {/* Contenido principal */}
        <main className="col-md-9 col-lg-10">
          <div className="p-4 rounded-4 shadow-sm bg-white">
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
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
