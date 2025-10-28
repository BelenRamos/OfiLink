import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Roles from './Roles';
import Permisos from './Permisos';
import Grupos from './Grupos';
import Asignaciones from './Asignaciones';
import Auditoria from './Auditoria';
import SessionLogs from './SessionLogs';
import { useAuth } from '../../../hooks/useAuth';

const Seguridad = () => {
    const { tienePermiso, isLoading } = useAuth();
    const PERMISO_VER_SEGURIDAD = 'ver_seguridad';

    if (isLoading) {
        return <div className="container mt-4"><p>Cargando información de seguridad...</p></div>;
    }

    if (!tienePermiso(PERMISO_VER_SEGURIDAD)) {
        return (
            <div className="container mt-4">
                <div className="alert alert-danger" role="alert">
                    🚫 **Acceso denegado.** No tienes el permiso requerido para acceder al Módulo de Seguridad.
                </div>
            </div>
        );
    }
    
    return (
      <div className="container mt-4">
        <h4>Módulo de Seguridad</h4>
        <div className="row">
          <div className="col-md-3">
            <ul className="list-group">
              <li className="list-group-item"><Link to="sessionLogs">Historial de Sesiones</Link></li>
              <li className="list-group-item"><Link to="roles">Roles</Link></li>
{/*               <li className="list-group-item"><Link to="permisos">Permisos</Link></li> */}
              <li className="list-group-item"><Link to="grupos">Grupos</Link></li>
              {/* <li className="list-group-item"><Link to="asignaciones">Asignaciones</Link></li> */}
              <li className="list-group-item"><Link to="auditoria">Auditoría</Link></li>
            </ul>
          </div>
          <div className="col-md-9">
            <Routes>
              <Route path="sessionLogs" element={<SessionLogs />} />
              <Route path="roles" element={<Roles />} />
              <Route path="permisos" element={<Permisos />} />
              <Route path="grupos" element={<Grupos />} />
              <Route path="asignaciones" element={<Asignaciones />} />
              <Route path="auditoria" element={<Auditoria />} />
            </Routes>
          </div>
        </div>
      </div>
    );
};

export default Seguridad;