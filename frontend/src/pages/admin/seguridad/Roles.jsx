import React, { useEffect, useState, useCallback } from 'react';
//import axios from 'axios';
import { apiFetch } from '../../../utils/apiFetch';
import TablaRoles from '../../../components/TablaRoles'; 
import FormularioAgregarRol from '../../../components/FormularioAgregarRol';
import AsignarPermisosModal from '../../../components/AsignarPermisosModal';

// Componente Principal
const Roles = () => {
    const [roles, setRoles] = useState([]);
    const [todosLosPermisos, setTodosLosPermisos] = useState([]); 
    const [error, setError] = useState('');
    const [exito, setExito] = useState('');
    const [expanded, setExpanded] = useState({}); // control de expandir/contraer general y del modal
    const [modalRol, setModalRol] = useState(null); // Rol seleccionado para el modal

    const fetchRoles = useCallback(async () => {
        try {
            const responseData = await apiFetch('/api/roles');
            setRoles(responseData);
            setError('');
        } catch (error) {
            setError('Error al obtener roles. Verifique permisos.');
            setRoles([]);
        }
    }, []);

    const fetchTodosLosPermisos = useCallback(async () => {
        try {
            const responseData = await apiFetch('/api/permisos');
            setTodosLosPermisos(responseData);
        } catch (error) {
            console.error('Error al obtener todos los permisos:', error);
        }
    }, []);

    useEffect(() => {
        fetchRoles();
        fetchTodosLosPermisos();
    }, [fetchRoles, fetchTodosLosPermisos]);
    
    const toggleExpand = (id) => {
        setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const abrirModalPermisos = (rol) => {
        setModalRol(rol);
        setError('');
        setExito(''); 
    };

    const cerrarModalPermisos = () => {
        setModalRol(null);
    };

    return (
        <div>
            <h5>Gestión de Roles</h5>
            {error && <div className="alert alert-danger">{error}</div>}
            {exito && <div className="alert alert-success">{exito}</div>}

            <FormularioAgregarRol 
                fetchRoles={fetchRoles} 
                setError={setError} 
                setExito={setExito}
            />

            {/* Tabla de Roles (CRUD) */}
            <TablaRoles
                roles={roles}
                fetchRoles={fetchRoles}
                setError={setError}
                setExito={setExito}
                abrirModalPermisos={abrirModalPermisos}
            />

            {/* Modal para Asignación de Permisos */}
            {modalRol && (
                <AsignarPermisosModal
                    rol={modalRol}
                    todosLosPermisos={todosLosPermisos}
                    cerrarModal={cerrarModalPermisos}
                    setError={setError}
                    setExito={setExito}
                    expanded={expanded} 
                    toggleExpand={toggleExpand}
                />
            )}
        </div>
    );
};

export default Roles;