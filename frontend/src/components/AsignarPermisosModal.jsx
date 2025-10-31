import React, { useState, useEffect } from 'react';
//import axios from 'axios';
import { apiFetch } from '../utils/apiFetch';
import { FaTimes } from 'react-icons/fa';
import PermisoAsignacionItem from './PermisoAsignacionItem'; 

const AsignarPermisosModal = ({ rol, todosLosPermisos, cerrarModal, setError, setExito, expanded, toggleExpand }) => {
    const [permisosAsignados, setPermisosAsignados] = useState([]);
    const [loading, setLoading] = useState(true);

    // Obtener los permisos asignados al rol al abrir el modal
    useEffect(() => {
        const fetchPermisosPorRol = async () => {
            try {
                const data = await apiFetch(`/api/roles/${rol.Id}/permisos`);
                setPermisosAsignados(data);  //{ RolId, PermisoId }
            } catch (error) {
                console.error('Error al obtener permisos por rol:', error);
                setError('Error al cargar los permisos del rol.');
                setPermisosAsignados([]);
            } finally {
                setLoading(false);
            }
        };

        fetchPermisosPorRol();
    }, [rol.Id, setError]); 

    const handleTogglePermiso = (permisoId, estaAsignado) => {
        if (estaAsignado) {
            setPermisosAsignados(prev => prev.filter(p => p.PermisoId !== permisoId));
        } else {
            setPermisosAsignados(prev => [...prev, { RolId: rol.Id, PermisoId: permisoId }]);
        }
    };


    const handleGuardarPermisos = async () => {
        setError('');
        setExito('');
        setLoading(true);

        try {
            const permisosIds = permisosAsignados.map(p => p.PermisoId); 
            await apiFetch(`/api/roles/${rol.Id}/permisos`, { 
                method: 'POST', 
                body: { permisosIds } 
            });
            
            setExito(`Permisos del rol '${rol.Nombre}' guardados con éxito.`);
            cerrarModal();
        } catch (err) {
            setError(err.response?.error || 'Error al guardar permisos.');
        } finally {
            setLoading(false);
        }
    };


    // Prepara el árbol de todos los permisos (solo los nodos raíz)
    const permisosRaiz = todosLosPermisos.filter(p => p.PadreId === null);
    
    return (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Asignar Permisos a: {rol.Nombre}</h5>
                        <button type="button" className="btn-close" onClick={cerrarModal} disabled={loading}><FaTimes/></button>
                    </div>
                    <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                        {loading ? (
                            <p>Cargando permisos...</p>
                        ) : (
                            <ul style={{ paddingLeft: '0' }}>
                                {permisosRaiz.map(p => (
                                    <PermisoAsignacionItem
                                        key={p.Id}
                                        permiso={p}
                                        todos={todosLosPermisos}
                                        expanded={expanded}
                                        toggleExpand={toggleExpand}
                                        rolPermisos={permisosAsignados}
                                        onTogglePermiso={handleTogglePermiso}
                                    />
                                ))}
                            </ul>
                        )}
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={cerrarModal} disabled={loading}>Cancelar</button>
                        <button type="button" className="btn btn-primary" onClick={handleGuardarPermisos} disabled={loading}>
                            {loading ? 'Guardando...' : 'Guardar Permisos'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AsignarPermisosModal;