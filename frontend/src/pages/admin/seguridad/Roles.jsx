import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import TablaRoles from '../../../components/TablaRoles'; 
import FormularioAgregarRol from '../../../components/FormularioAgregarRol';
import AsignarPermisosModal from '../../../components/AsignarPermisosModal';

// Componente Principal
const Roles = () => {
    // --- ESTADOS ---
    const [roles, setRoles] = useState([]);
    const [todosLosPermisos, setTodosLosPermisos] = useState([]); 
    const [error, setError] = useState('');
    const [exito, setExito] = useState('');
    const [expanded, setExpanded] = useState({}); // control de expandir/contraer general y del modal
    const [modalRol, setModalRol] = useState(null); // Rol seleccionado para el modal

    // --- FETCHING DE DATOS ---

    const fetchRoles = useCallback(async () => {
        try {
            const response = await axios.get('/api/roles');
            setRoles(response.data);
            setError('');
        } catch (error) {
            setError('Error al obtener roles.');
            setRoles([]);
        }
    }, []);

    const fetchTodosLosPermisos = useCallback(async () => {
        try {
            const response = await axios.get('/api/permisos');
            setTodosLosPermisos(response.data);
        } catch (error) {
            console.error('Error al obtener todos los permisos:', error);
        }
    }, []);

    useEffect(() => {
        fetchRoles();
        fetchTodosLosPermisos();
    }, [fetchRoles, fetchTodosLosPermisos]);
    
    // --- MANEJO DE EXPANSION (GLOBAL) ---
    const toggleExpand = (id) => {
        setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    // --- MANEJO DE MODAL ---
    const abrirModalPermisos = (rol) => {
        setModalRol(rol);
        // Resetea el estado de éxito/error al abrir un modal de acción
        setError('');
        setExito(''); 
    };

    const cerrarModalPermisos = () => {
        setModalRol(null);
    };

    // --- RENDERIZADO ---
    return (
        <div>
            <h5>Gestión de Roles</h5>
            
            {/* Mensajes de feedback */}
            {error && <div className="alert alert-danger">{error}</div>}
            {exito && <div className="alert alert-success">{exito}</div>}

            {/* Formulario de Adición */}
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
                    // Pasamos expanded y toggleExpand para controlar el árbol del modal
                    expanded={expanded} 
                    toggleExpand={toggleExpand}
                />
            )}
        </div>
    );
};

export default Roles;