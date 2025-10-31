import React, { useState, useEffect } from 'react';
//import axios from 'axios';
import { apiFetch } from '../utils/apiFetch';
import { FaTimes } from 'react-icons/fa';

const AsignarRolesModal = ({ grupo, todosLosRoles, cerrarModal, setError, setExito }) => {
    const [rolesAsignados, setRolesAsignados] = useState([]);
    const [loading, setLoading] = useState(true);

    // 1. Obtener los Roles ya asignados al Grupo
    useEffect(() => {
        const fetchRolesPorGrupo = async () => {
            try {
                const data = await apiFetch(`/api/grupos/${grupo.Id}/roles`);
                setRolesAsignados(data);
            } catch (error) {
                console.error('Error al obtener roles por grupo:', error);
                setError('Error al cargar los roles del grupo.');
            } finally {
                setLoading(false);
            }
        };
        fetchRolesPorGrupo();
    }, [grupo.Id, setError]);

    const handleToggleRol = (rolId, estaAsignado) => {
        if (estaAsignado) {
            setRolesAsignados(prev => prev.filter(r => r.RolId !== rolId));
        } else {
            setRolesAsignados(prev => [...prev, { GrupoId: grupo.Id, RolId: rolId }]);
        }
    };

    const handleGuardarRoles = async () => {
        setError('');
        setExito('');
        setLoading(true);

        try {
        const rolesIds = rolesAsignados.map(r => r.RolId); 
        await apiFetch(`/api/grupos/${grupo.Id}/roles`, { 
            method: 'PUT', 
            body: { rolesIds } 
        });           
            setExito(`Roles del grupo '${grupo.Nombre}' guardados con éxito.`);
            cerrarModal();
        } catch (err) {
            setError(err.response?.data?.error || 'Error al guardar roles.');
        } finally {
            setLoading(false);
        }
    };

    // Lista de IDs de roles asignados para facilitar la verificación en el render
    const rolesAsignadosIds = rolesAsignados.map(r => r.RolId);

    return (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Asignar Roles a: {grupo.Nombre}</h5>
                        <button type="button" className="btn-close" onClick={cerrarModal} disabled={loading}><FaTimes/></button>
                    </div>
                    <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                        {loading ? (
                            <p>Cargando roles...</p>
                        ) : (
                            <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
                                {todosLosRoles.map((rol) => {
                                    const isChecked = rolesAsignadosIds.includes(rol.Id);
                                    return (
                                        <li key={rol.Id}>
                                            <input 
                                                type="checkbox" 
                                                id={`rol-${rol.Id}`} 
                                                checked={isChecked}
                                                onChange={() => handleToggleRol(rol.Id, isChecked)} 
                                                className='me-2'
                                            />
                                            <label htmlFor={`rol-${rol.Id}`}>{rol.Nombre}</label>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={cerrarModal} disabled={loading}>Cancelar</button>
                        <button type="button" className="btn btn-primary" onClick={handleGuardarRoles} disabled={loading}>
                            {loading ? 'Guardando...' : 'Guardar Roles'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AsignarRolesModal;