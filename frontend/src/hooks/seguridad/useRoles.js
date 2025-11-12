import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../../utils/apiFetch';

/**
 * Hook personalizado para manejar la lógica de la gestión de Roles y Permisos.
 * Se encarga de la carga inicial de datos (roles y todos los permisos),
 * la gestión de mensajes de éxito/error, y el estado de los modales.
 */
const useRoles = () => {
    // --- 1. Estados de Datos ---
    const [roles, setRoles] = useState([]);
    const [todosLosPermisos, setTodosLosPermisos] = useState([]); 
    
    // --- 2. Estados de UI/Feedback ---
    const [error, setError] = useState('');
    const [exito, setExito] = useState('');
    const [modalRol, setModalRol] = useState(null); // Rol seleccionado para el modal de Permisos
    const [rolAEliminar, setRolAEliminar] = useState(null); // Rol seleccionado para el modal de Confirmación
    const [expanded, setExpanded] = useState({}); // Control de expandir/contraer general o en el modal

    // --- 3. Limpieza de mensajes de feedback ---
    useEffect(() => {
        let timerError;
        if (error) {
            timerError = setTimeout(() => setError(''), 5000); 
        }

        let timerExito;
        if (exito) {
            timerExito = setTimeout(() => setExito(''), 5000);
        }

        return () => {
            clearTimeout(timerError);
            clearTimeout(timerExito);
        };
    }, [error, exito]);

    // --- 4. Funciones de Carga de Datos (API) ---

    // Carga los roles existentes
    const fetchRoles = useCallback(async () => {
        try {
            const responseData = await apiFetch('/api/roles');
            setRoles(responseData);
            setError('');
        } catch (error) {
            console.error('Error fetching roles:', error);
            const errorMessage = error.message || 'Error al obtener roles. Verifique permisos.';
            setError(errorMessage);
            setRoles([]);
        }
    }, []);

    // Carga todos los permisos disponibles en el sistema
    const fetchTodosLosPermisos = useCallback(async () => {
        try {
            const responseData = await apiFetch('/api/permisos');
            setTodosLosPermisos(responseData);
        } catch (error) {
            console.error('Error al obtener todos los permisos:', error);
        }
    }, []);

    // --- 5. Efecto de Carga Inicial ---

    useEffect(() => {
        fetchRoles();
        fetchTodosLosPermisos();
    }, [fetchRoles, fetchTodosLosPermisos]);
    
    // --- 6. Handlers de UI y Acciones de CRUD ---

    const toggleExpand = (id) => {
        setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    // Modal de Permisos
    const abrirModalPermisos = (rol) => {
        setModalRol(rol);
        setError('');
        setExito(''); 
    };

    const cerrarModalPermisos = () => {
        setModalRol(null);
    };

    // Modal de Confirmación de Eliminación
    const handleAbrirConfirmacionEliminar = (rol) => {
        setRolAEliminar(rol);
    };

    const handleCerrarConfirmacionEliminar = () => {
        setRolAEliminar(null);
    };

    const confirmarEliminarRol = async () => {
        if (!rolAEliminar) return;

        const { Id, Nombre } = rolAEliminar;

        try {
            await apiFetch(`/api/roles/${Id}`, { method: 'DELETE' });
            setExito(`Rol "${Nombre}" eliminado con éxito.`);
            // Limpiamos el rol a eliminar y refrescamos la lista
            handleCerrarConfirmacionEliminar();
            fetchRoles(); 
        } catch (err) {
            console.error('Error al eliminar el rol:', err);
            setError(err.message || 'Error al eliminar el rol. Verifique que no esté asignado a ningún usuario.');
            handleCerrarConfirmacionEliminar(); // Cerramos el modal incluso si hay error
        }
    };

    // --- 7. Retorno del Hook ---

    return {
        // Data
        roles,
        todosLosPermisos,
        
        // Feedback
        error,
        setError,
        exito,
        setExito,

        // Modal y UI State
        modalRol,
        rolAEliminar, // Nuevo estado
        expanded,
        toggleExpand,
        abrirModalPermisos,
        cerrarModalPermisos,
        handleAbrirConfirmacionEliminar, // Nuevo handler
        handleCerrarConfirmacionEliminar, // Nuevo handler
        confirmarEliminarRol, // Nueva acción

        // Actions
        fetchRoles, 
    };
};

export default useRoles;