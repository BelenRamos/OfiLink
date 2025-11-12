import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../../utils/apiFetch';
import { useAuth } from '../../hooks/useAuth'; 

const PERMISO_GESTIONAR = 'gestionar_grupos'; 

/**
 * Hook personalizado para manejar toda la lógica de la pantalla de Gestión de Grupos (CRUD, Roles, Permisos).
 * @returns {object} Un objeto con todos los estados y funciones de acción necesarios para el componente de UI.
 */
const useGrupos = () => {
    const { tienePermiso, isLoading } = useAuth();
    
    // --- 1. Estados de Datos y UI ---
    const [grupos, setGrupos] = useState([]);
    const [roles, setRoles] = useState([]); 
    const [error, setError] = useState('');
    const [exito, setExito] = useState('');
    
    // Estados de Modales y Edición
    const [modalGrupo, setModalGrupo] = useState(null); 
    const [grupoAEditar, setGrupoAEditar] = useState(null); 
    const [grupoAEliminar, setGrupoAEliminar] = useState(null); 
    const [showAccessDeniedModal, setShowAccessDeniedModal] = useState(false); 

    // --- 2. Lógica de Fetching (Carga de Datos) ---

    const fetchGrupos = useCallback(async () => {
        if (!tienePermiso(PERMISO_GESTIONAR)) return;

        try {
            const responseData = await apiFetch('/api/grupos');
            setGrupos(responseData);
            setError('');
        } catch (err) {
            setError('Error al cargar grupos. Verifique permisos.');
        }
    }, [tienePermiso]);

    const fetchRoles = useCallback(async () => {
        if (!tienePermiso(PERMISO_GESTIONAR)) return;

        try {
            const responseData = await apiFetch('/api/roles'); 
            setRoles(responseData);
        } catch (err) {
            console.error('Error al cargar la lista maestra de roles:', err);
        }
    }, [tienePermiso]);

    // --- 3. Efectos de Carga Inicial y Permisos ---

    useEffect(() => {
        if (!isLoading) {
            if (tienePermiso(PERMISO_GESTIONAR)) {
                fetchGrupos();
                fetchRoles();
            } else {
                setShowAccessDeniedModal(true);
            }
        }
    }, [isLoading, tienePermiso, fetchGrupos, fetchRoles]);

    // --- 4. Efecto para Auto-Desaparición de Mensajes ---
    useEffect(() => {
        let timer;
        if (exito || error) {
            timer = setTimeout(() => {
                setExito('');
                setError('');
            }, 3000); 
        }
        return () => clearTimeout(timer);
    }, [exito, error]);

    // --- 5. Funciones de Manejo de UI y CRUD ---

    // Manejo de Modal de Roles
    const abrirModalRoles = useCallback((grupo) => {
        setModalGrupo(grupo);
        setError('');
        setExito('');
    }, []);

    const cerrarModalRoles = useCallback(() => {
        setModalGrupo(null);
    }, []);

    // Manejo de Edición de Grupo
    const abrirEdicion = useCallback((grupo) => {
        setGrupoAEditar(grupo);
        setError('');
        setExito('');
    }, []);

    const cerrarEdicion = useCallback(() => {
        setGrupoAEditar(null);
    }, []);
    
    // Manejo de Eliminación
    const handleAbrirConfirmacionEliminar = useCallback((grupo) => {
        setGrupoAEliminar(grupo);
    }, []);

    const handleCerrarConfirmacionEliminar = useCallback(() => {
        setGrupoAEliminar(null);
    }, []);

    const confirmarEliminarGrupo = useCallback(async () => {
        if (!grupoAEliminar) return;

        const { Id, Nombre } = grupoAEliminar;

        try {
            await apiFetch(`/api/grupos/${Id}`, { method: 'DELETE' });
            setExito(`Grupo "${Nombre}" eliminado con éxito.`);
            fetchGrupos(); // Refrescar la lista
            setError('');
        } catch (err) {
            setError(err.message || 'Error al eliminar el grupo. Podría tener personas asociadas.');
        } finally {
            setGrupoAEliminar(null); // Cerrar el modal de confirmación
        }
    }, [grupoAEliminar, fetchGrupos]);

    return {
        grupos,
        roles,
        isLoadingAuth: isLoading,
        isAllowed: tienePermiso(PERMISO_GESTIONAR),
        error,
        exito,
        modalGrupo,
        grupoAEditar,
        grupoAEliminar,
        showAccessDeniedModal,
        fetchGrupos, 
        setError,    
        setExito,   
        abrirModalRoles,
        cerrarModalRoles,
        abrirEdicion,
        cerrarEdicion,
        handleAbrirConfirmacionEliminar,
        handleCerrarConfirmacionEliminar,
        confirmarEliminarGrupo,
        PERMISO_GESTIONAR,
        setShowAccessDeniedModal 
    };
};

export default useGrupos;