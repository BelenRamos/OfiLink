import { useState, useEffect } from 'react';
import { apiFetch } from '../../utils/apiFetch'; 
import { useAuth } from '../../hooks/useAuth';
import OficioModal from '../../components/OficioModal';
import GenericConfirmModal from '../../components/GenericConfirmModal'; 

const Oficios = () => {
    const { tienePermiso, isLoading } = useAuth();
    const [oficios, setOficios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mensaje, setMensaje] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [currentOficio, setCurrentOficio] = useState(null); 
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null); // Objeto del oficio a eliminar

    const API_BASE_URL = '/api/oficios';

    const PERMISO_VER = 'ver_oficios';
    const PERMISO_CREAR = 'crear_oficio';
    const PERMISO_EDITAR = 'editar_oficio';
    const PERMISO_ELIMINAR = 'eliminar_oficio';

    useEffect(() => {
        if (!isLoading) {
            if (tienePermiso(PERMISO_VER)) {
                fetchOficios();
            } else {
                setLoading(false); 
                setMensaje('No tienes permiso para ver la gestión de oficios.');
            }
        }
    }, [isLoading, tienePermiso]);

    const extractErrorMessage = (error, defaultMessage) => {
        const errorBody = error.response || {};
        const errorMessage = errorBody.error || defaultMessage;
        return errorMessage + (errorBody.details ? ` (${errorBody.details})` : '');
    };

    //CARGAR OFICIOS
    const fetchOficios = async () => {
        if (!tienePermiso(PERMISO_VER)) return;
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
    };
    
    const handleAddClick = () => {
        if (!tienePermiso(PERMISO_CREAR)) { 
            setMensaje('No tiene permiso para crear oficios.');
            return;
        }
        setCurrentOficio(null); 
        setShowModal(true);
    };

    const handleEditClick = (oficio) => {
        if (!tienePermiso(PERMISO_EDITAR)) {
            setMensaje('No tiene permiso para editar oficios.');
            return;
        }
        setCurrentOficio(oficio); 
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setCurrentOficio(null);
    };

    //GUARDAR OFICIO
    const handleSaveOficio = async (oficioData) => {
        const isEdit = !!currentOficio;
        if (isEdit && !tienePermiso(PERMISO_EDITAR)) {
            setMensaje('Error: Permiso de edición denegado.');
            return;
        }
        if (!isEdit && !tienePermiso(PERMISO_CREAR)) {
            setMensaje('Error: Permiso de creación denegado.');
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
    };
    
    const handleOpenConfirmDelete = (oficio) => {
        if (!tienePermiso(PERMISO_ELIMINAR)) {
            setMensaje('No tiene permiso para eliminar oficios.');
            return;
        }
        setItemToDelete(oficio);
        setShowConfirmModal(true);
    };

    const handleCloseConfirmDelete = () => {
        setShowConfirmModal(false);
        setItemToDelete(null);
    };

    //ELIMINAR OFICIO
    const handleDelete = async () => {
        if (!tienePermiso(PERMISO_ELIMINAR)) { 
            setMensaje('Error: Permiso de eliminación denegado.');
            handleCloseConfirmDelete();
            return;
        }
        const { Id, Nombre } = itemToDelete;  // La información del oficio está en itemToDelete
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
    };

    if (isLoading || loading) return <div className="container mt-4"><p>Cargando permisos y oficios...</p></div>;

    if (!tienePermiso(PERMISO_VER)) {
        return <h2 className="container mt-4 text-danger">No tienes permiso para ver la gestión de oficios.</h2>;
    }

    const deleteModalProps = itemToDelete ? {
        title: "⚠️ Confirmar Eliminación",
        message: `¿Está seguro de que desea eliminar el oficio "${itemToDelete.Nombre}"?`,
        confirmText: "Eliminar",
        confirmButtonClass: "btn-danger",
        cancelText: "Cancelar"
    } : {};

    return (
        <div className="container mt-4">
            <h2>Gestión de Oficios 🛠️</h2>
            {mensaje && <div className="alert alert-info">{mensaje}</div>}

            <div className="d-flex justify-content-end mb-3">
                {tienePermiso(PERMISO_CREAR) && (
                    <button 
                    className="btn btn-primary"
                    onClick={handleAddClick}
                    >
                        ➕ Agregar Oficio
                    </button>
                )}
            </div>
            {/* TABLA DE OFICIOS */}
            <table className="table table-bordered table-striped">
                <thead className="table-light">
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Descripción</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {oficios.length > 0 ? (
                        oficios.map((oficio) => (
                            <tr key={oficio.Id}>
                                <td>{oficio.Id}</td>
                                <td>{oficio.Nombre}</td>
                                <td>{oficio.Descripcion || <span className="text-muted">Sin descripción</span>}</td>
                                <td className="text-nowrap">
                                    {tienePermiso(PERMISO_EDITAR) && (
                                    <button
                                        className="btn btn-sm btn-info me-2"
                                        onClick={() => handleEditClick(oficio)}
                                    >
                                        ✏️ Editar
                                    </button>
                                    )}
                                    {tienePermiso(PERMISO_ELIMINAR) && (
                                    <button
                                        className="btn btn-sm btn-danger"
                                        onClick={() => handleOpenConfirmDelete(oficio)}
                                    >
                                        🗑️ Eliminar
                                    </button>
                                    )}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="4" className="text-center">No hay oficios registrados.</td>
                        </tr>
                    )}
                </tbody>
            </table>
            {showModal && (
                <OficioModal
                    oficio={currentOficio}
                    onClose={handleCloseModal}
                    onSave={handleSaveOficio}
                />
            )}
            {showConfirmModal && (
                <GenericConfirmModal
                    show={showConfirmModal}
                    onClose={handleCloseConfirmDelete}
                    onConfirm={handleDelete} // La acción a ejecutar
                    {...deleteModalProps} // Propiedades dinámicas (título, mensaje, clase)
                />
            )}
        </div>
    );
};

export default Oficios;