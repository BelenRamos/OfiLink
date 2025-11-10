import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../../utils/apiFetch';

/**
 * Hook personalizado para manejar la lógica de la gestión de Roles y Permisos.
 * Se encarga de la carga inicial de datos (roles y todos los permisos),
 * la gestión de mensajes de éxito/error, y el estado del modal de permisos.
 */
const useRoles = () => {
    // --- 1. Estados de Datos ---
    const [roles, setRoles] = useState([]);
    const [todosLosPermisos, setTodosLosPermisos] = useState([]); 
    
    // --- 2. Estados de UI/Feedback ---
    const [error, setError] = useState('');
    const [exito, setExito] = useState('');
    const [modalRol, setModalRol] = useState(null); // Rol seleccionado para el modal
    const [expanded, setExpanded] = useState({}); // Control de expandir/contraer general o en el modal

    // --- 3. Funciones de Carga de Datos (API) ---

    // Carga los roles existentes
    const fetchRoles = useCallback(async () => {
        try {
            const responseData = await apiFetch('/api/roles');
            setRoles(responseData);
            setError('');
        } catch (error) {
            console.error('Error fetching roles:', error);
            // Asumiendo que `apiFetch` lanza un error con un mensaje
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
            // Esto solo se registra en consola ya que no es un error que impida mostrar la tabla de roles
        }
    }, []);

    // --- 4. Efecto de Carga Inicial ---

    useEffect(() => {
        // Carga de datos al montar el componente
        fetchRoles();
        fetchTodosLosPermisos();
    }, [fetchRoles, fetchTodosLosPermisos]);
    
    // --- 5. Handlers de UI ---

    // Alterna el estado de expansión de un elemento (usado típicamente en el modal de permisos)
    const toggleExpand = (id) => {
        setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    // Abre el modal de permisos para un rol específico
    const abrirModalPermisos = (rol) => {
        setModalRol(rol);
        // Limpia mensajes al abrir el modal
        setError('');
        setExito(''); 
    };

    // Cierra el modal de permisos
    const cerrarModalPermisos = () => {
        setModalRol(null);
    };

    // --- 6. Retorno del Hook ---

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
        expanded,
        toggleExpand,
        abrirModalPermisos,
        cerrarModalPermisos,

        // Actions
        fetchRoles, // Necesario para refrescar la lista tras un CRUD
    };
};

export default useRoles;