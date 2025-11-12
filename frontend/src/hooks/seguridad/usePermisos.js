import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../../utils/apiFetch';
import { useAuth } from '../../hooks/useAuth';
import { arrayToTree } from '../../utils/arrayToTree';

const PERMISO_GESTIONAR = 'gestionar_permisos';

/**
 * Hook personalizado para manejar toda la lógica de la pantalla de Gestión de Permisos.
 * @returns {object} Un objeto con estados, datos y funciones de acción para el componente de UI.
 */
const usePermisos = () => {
    const { tienePermiso, isLoading } = useAuth();
    
    // --- 1. Estados de Datos y UI ---
    const [permisosPlano, setPermisosPlano] = useState([]);
    const [permisosArbol, setPermisosArbol] = useState([]);
    const [error, setError] = useState('');
    const [exito, setExito] = useState('');
    
    // Estados de Modales y Edición
    const [permisoAEditar, setPermisoAEditar] = useState(null); 
    const [showFormModal, setShowFormModal] = useState(false); 
    const [permisoAEliminar, setPermisoAEliminar] = useState(null); 
    const [showAccessDeniedModal, setShowAccessDeniedModal] = useState(false);

    // --- 2. Lógica de Fetching (Carga de Datos) ---

    const fetchPermisos = useCallback(async () => {
        // No intentar cargar si no tiene el permiso
        if (!tienePermiso(PERMISO_GESTIONAR)) return;

        try {
            const dataPlana = await apiFetch('/api/permisos');
            setPermisosPlano(dataPlana);
            // Convierte el array plano en una estructura de árbol para la UI
            setPermisosArbol(arrayToTree(dataPlana)); 
            setError('');
        } catch (err) {
            setError(err.message || 'Error al cargar permisos. Verifique permisos.');
        }
    }, [tienePermiso]);

    // --- 3. Efectos de Carga Inicial y Permisos ---

    useEffect(() => {
        if (!isLoading) {
            if (tienePermiso(PERMISO_GESTIONAR)) {
                fetchPermisos();
            } else {
                // Si no tiene permiso, muestra el modal de acceso denegado
                setShowAccessDeniedModal(true);
            }
        }
    }, [isLoading, tienePermiso, fetchPermisos]);

    // --- 4. Efecto para Auto-Desaparición de Mensajes (CRÍTICO: 5 segundos) ---
    useEffect(() => {
        let timer;
        if (exito || error) {
            // Establecer un temporizador para limpiar los mensajes después de 5 segundos
            timer = setTimeout(() => {
                setExito('');
                setError('');
            }, 5000); 
        }
        // Limpieza para evitar fugas de memoria
        return () => clearTimeout(timer);
    }, [exito, error]);

    // --- 5. Funciones de Mensajería Global ---

    const displaySuccess = useCallback((message) => {
        setExito(message);
        setError(''); 
    }, []);

    const displayError = useCallback((message) => {
        setError(message);
        setExito(''); 
    }, []);

    // --- 6. Funciones de Manejo de UI y CRUD ---

    const handleAbrirEdicion = useCallback((permiso = null) => {
        setPermisoAEditar(permiso);
        setShowFormModal(true); 
        setError('');
        setExito('');
    }, []);

    const handleCerrarEdicion = useCallback(() => {
        setPermisoAEditar(null);
        setShowFormModal(false); 
    }, []);

    const handleAbrirConfirmacionEliminar = useCallback((permiso) => {
        setPermisoAEliminar(permiso);
    }, []);

    const handleCerrarConfirmacionEliminar = useCallback(() => {
        setPermisoAEliminar(null);
    }, []);

    const confirmarEliminarPermiso = useCallback(async () => {
        if (!permisoAEliminar) return;

        const { Id, Nombre } = permisoAEliminar;

        try {
            await apiFetch(`/api/permisos/${Id}`, { method: 'DELETE' });
            displaySuccess(`Permiso "${Nombre}" eliminado con éxito.`); 
            fetchPermisos();
        } catch (err) {
            displayError(err.message || 'Error al eliminar el permiso. Verifique que no tenga permisos hijos asociados.'); 
        } finally {
            setPermisoAEliminar(null); // Siempre cerrar el modal después de la acción
        }
    }, [permisoAEliminar, fetchPermisos, displaySuccess, displayError]);

    // --- 7. Retorno del Hook ---

    return {
        permisosPlano,
        permisosArbol,
        isLoadingAuth: isLoading,
        isAllowed: tienePermiso(PERMISO_GESTIONAR),
        error,
        exito,
        permisoAEditar,
        showFormModal,
        permisoAEliminar,
        showAccessDeniedModal,
        fetchPermisos,
        displaySuccess,
        displayError,
        handleAbrirEdicion,
        handleCerrarEdicion,
        handleAbrirConfirmacionEliminar,
        handleCerrarConfirmacionEliminar,
        confirmarEliminarPermiso,
        setShowAccessDeniedModal,
        PERMISO_GESTIONAR,
    };
};

export default usePermisos;