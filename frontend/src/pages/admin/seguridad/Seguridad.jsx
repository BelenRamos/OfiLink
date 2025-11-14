import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import Roles from './Roles';
import Permisos from './Permisos';
import Grupos from './Grupos';
import Asignaciones from './Asignaciones';
import Auditoria from './Auditoria';
import SessionLogs from './SessionLogs';
import { useAuth } from '../../../hooks/useAuth';

const Seguridad = () => {
  const { tienePermiso, isLoading } = useAuth();
  const location = useLocation();
  const PERMISO_VER_SEGURIDAD = 'ver_seguridad';

  if (isLoading) {
    return (
      <div className="container mt-5 text-center">
        <p>Cargando información de seguridad...</p>
      </div>
    );
  }

  if (!tienePermiso(PERMISO_VER_SEGURIDAD)) {
    return (
      <div className="container mt-5 text-center">
        <div className="alert alert-danger">
          🚫 Acceso denegado. No tienes el permiso requerido para acceder al Módulo de Seguridad.
        </div>
      </div>
    );
  }

  const menuItems = [
    { path: 'sessionLogs', label: 'Historial de Sesiones' },
    { path: 'roles', label: 'Roles' },
    { path: 'permisos', label: 'Permisos' },
    { path: 'grupos', label: 'Grupos' },
    { path: 'asignaciones', label: 'Asignaciones' },
    { path: 'auditoria', label: 'Auditoría' },
  ];

  return (
    <div className="container-fluid py-4">
      <div className="row">
        {/* Menú lateral del módulo de seguridad */}
        <aside className="col-md-3 col-lg-2 mb-4">
          <div
            className="p-3 rounded-4 shadow-sm"
            style={{
              backgroundColor: 'rgb(45, 48, 53)',
              color: 'white',
            }}
          >
            <h4 className="mb-3 text-center" style={{ color: 'rgb(212, 226, 113)' }}>
              Módulo de Seguridad
            </h4>
            <ul className="list-unstyled">
              {menuItems.map((item) => {
                const isActive = location.pathname.endsWith(item.path);
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
              <Route path="sessionLogs" element={<SessionLogs />} />
              <Route path="roles" element={<Roles />} />
              <Route path="permisos" element={<Permisos />} />
              <Route path="grupos" element={<Grupos />} />
              <Route path="asignaciones" element={<Asignaciones />} />
              <Route path="auditoria" element={<Auditoria />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Seguridad;
