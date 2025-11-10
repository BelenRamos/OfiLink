import { useState, useEffect, useCallback, useMemo } from 'react';
import { apiFetch } from '../../utils/apiFetch';

const API_BASE_URL = '/api/oficios';

const PERMISO_VER = 'ver_oficios';
const PERMISO_CREAR = 'crear_oficio';
const PERMISO_EDITAR = 'editar_oficio';
const PERMISO_ELIMINAR = 'eliminar_oficio';

/**
 * Hook personalizado para manejar la lógica de la gestión de Oficios (CRUD y permisos).
 * @param {object} authContext - Contiene las funciones de useAuth (tienePermiso, isLoading).
 * @returns {object} Todos los estados y handlers necesarios para la UI.
 */
const useOficios = ({ tienePermiso, isLoading }) => {
    // --- 1. Estados de Datos y Control ---
    const [oficios, setOficios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mensaje, setMensaje] = useState('');
    
    // Estados de Modal
    const [showModal, setShowModal] = useState(false);
    const [currentOficio, setCurrentOficio] = useState(null); 
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    // --- 2. Permisos ---
    const puedeVer = tienePermiso(PERMISO_VER);
    const puedeCrear = tienePermiso(PERMISO_CREAR);
    const puedeEditar = tienePermiso(PERMISO_EDITAR);
    const puedeEliminar = tienePermiso(PERMISO_ELIMINAR);

    // --- 3. Utilidades ---
    const extractErrorMessage = (error, defaultMessage) => {
        const errorBody = error.response || {};
        const errorMessage = errorBody.error || defaultMessage;
        return errorMessage + (errorBody.details ? ` (${errorBody.details})` : '');
    };

    // --- 4. Handlers de Carga y Modales ---

    // Cargar Oficios
    const fetchOficios = useCallback(async () => {
        if (!puedeVer) return;
        setLoading(true);
        try {
            const response = await apiFetch(API_BASE_URL);
            setOficios(response);
            setMensaje('');
        } catch (error) {
            const fullMessage = extractErrorMessage(error, 'Error al cargar la lista de oficios.');
            console.error('Error al cargar oficios:', error);
            setMensaje(fullMessage);
        } finally {
            setLoading(false);
        }
    }, [puedeVer]);
    
    // Efecto inicial de carga
    useEffect(() => {
        if (!isLoading) {
            if (puedeVer) {
                fetchOficios();
            } else {
                setLoading(false); 
                setMensaje('No tienes permiso para ver la gestión de oficios.');
            }
        }
    }, [isLoading, puedeVer, fetchOficios]); 
    
    // Abrir Modal de Creación
    const handleAddClick = useCallback(() => {
        if (!puedeCrear) { 
            setMensaje('No tiene permiso para crear oficios.');
            return;
        }
        setCurrentOficio(null); 
        setShowModal(true);
    }, [puedeCrear]);

    // Abrir Modal de Edición
    const handleEditClick = useCallback((oficio) => {
        if (!puedeEditar) {
            setMensaje('No tiene permiso para editar oficios.');
            return;
        }
        setCurrentOficio(oficio); 
        setShowModal(true);
    }, [puedeEditar]);

    // Cerrar Modal de Edición/Creación
    const handleCloseModal = useCallback(() => {
        setShowModal(false);
        setCurrentOficio(null);
    }, []);

    // Abrir Modal de Confirmación de Eliminación
    const handleOpenConfirmDelete = useCallback((oficio) => {
        if (!puedeEliminar) {
            setMensaje('No tiene permiso para eliminar oficios.');
            return;
        }
        setItemToDelete(oficio);
        setShowConfirmModal(true);
    }, [puedeEliminar]);

    // Cerrar Modal de Confirmación de Eliminación
    const handleCloseConfirmDelete = useCallback(() => {
        setShowConfirmModal(false);
        setItemToDelete(null);
    }, []);

    // --- 5. Handlers de Operaciones CRUD ---

    // Guardar (Crear o Editar) Oficio
    const handleSaveOficio = useCallback(async (oficioData) => {
        const isEdit = !!currentOficio;
        const permissionCheck = isEdit ? puedeEditar : puedeCrear;
        const permissionName = isEdit ? 'edición' : 'creación';

        if (!permissionCheck) {
            setMensaje(`Error: Permiso de ${permissionName} denegado.`);
            return;
        }

        const url = isEdit ? `${API_BASE_URL}/${currentOficio.Id}` : API_BASE_URL;
        const method = isEdit ? 'PUT' : 'POST';
        const action = isEdit ? 'actualizar' : 'agregar';

        try {
            await apiFetch(url, {
                method: method,
                body: oficioData
            });
            
            setMensaje(`Oficio ${action} con éxito. ✅`);
            handleCloseModal();
            fetchOficios(); 

        } catch (error) {
            const defaultMessage = `Error al ${action} el oficio.`;
            const fullMessage = extractErrorMessage(error, defaultMessage);
            
            console.error(`Error al ${action} oficio:`, error);
            setMensaje(fullMessage);
        }
    }, [currentOficio, puedeEditar, puedeCrear, handleCloseModal, fetchOficios]);

    // Eliminar Oficio
    const handleDelete = useCallback(async () => {
        if (!puedeEliminar || !itemToDelete) { 
            setMensaje('Error: Permiso de eliminación denegado o item no seleccionado.');
            handleCloseConfirmDelete();
            return;
        }
        
        const { Id, Nombre } = itemToDelete;
        handleCloseConfirmDelete();
        
        try {
            await apiFetch(`${API_BASE_URL}/${Id}`, {
                method: 'DELETE'
            });
            
            setMensaje(`Oficio "${Nombre}" eliminado con éxito. 🗑️`);
            fetchOficios(); 

        } catch (error) {
            const defaultMessage = "Error inesperado al eliminar el oficio.";
            const fullMessage = extractErrorMessage(error, defaultMessage);
        
            console.error("Error al eliminar:", error);
            setMensaje(fullMessage);
        }
    }, [puedeEliminar, itemToDelete, fetchOficios, handleCloseConfirmDelete]);

    // --- 6. Propiedades del Modal de Confirmación (Calculadas) ---
    const deleteModalProps = useMemo(() => itemToDelete ? {
        title: "⚠️ Confirmar Eliminación",
        message: `¿Está seguro de que desea eliminar el oficio "${itemToDelete.Nombre}"?`,
        confirmText: "Eliminar",
        confirmButtonClass: "btn-danger",
        cancelText: "Cancelar"
    } : {}, [itemToDelete]);

    // --- 7. Retorno del Hook ---
    return {
        // Estados de Datos
        oficios,
        mensaje,
        loading,
        
        // Estados de Modal
        showModal,
        currentOficio,
        showConfirmModal,
        
        // Handlers de UI
        handleAddClick,
        handleEditClick,
        handleCloseModal,
        handleOpenConfirmDelete,
        handleCloseConfirmDelete,

        // Handlers de Lógica
        handleSaveOficio,
        handleDelete,
        
        // Permisos y Carga
        puedeVer,
        puedeCrear,
        puedeEditar,
        puedeEliminar,
        isLoadingAuth: isLoading,
        
        // Props del Modal de Eliminación
        deleteModalProps,
    };
};

export default useOficios;