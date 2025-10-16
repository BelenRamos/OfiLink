import { useState, useEffect } from 'react';
import { apiFetch } from '../../utils/apiFetch'; 
import OficioModal from '../../components/OficioModal';
import GenericConfirmModal from '../../components/GenericConfirmModal'; // 💡 Importamos el modal genérico

const Oficios = () => {
    const [oficios, setOficios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mensaje, setMensaje] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [currentOficio, setCurrentOficio] = useState(null); 
    
    // 💡 NUEVOS ESTADOS para el modal de confirmación
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null); // Objeto del oficio a eliminar

    const API_BASE_URL = '/api/oficios';

    useEffect(() => {
        fetchOficios();
    }, []);

    const extractErrorMessage = (error, defaultMessage) => {
        const errorBody = error.response || {};
        const errorMessage = errorBody.error || defaultMessage;
        return errorMessage + (errorBody.details ? ` (${errorBody.details})` : '');
    };

    // --- CARGAR OFICIOS ---
    const fetchOficios = async () => {
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
        setCurrentOficio(null); 
        setShowModal(true);
    };

    const handleEditClick = (oficio) => {
        setCurrentOficio(oficio); 
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setCurrentOficio(null);
    };

    // --- GUARDAR OFICIO (handleSaveOficio) ---
    const handleSaveOficio = async (oficioData) => {
        const isEdit = !!currentOficio;
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
    
    // 💡 NUEVA FUNCIÓN: Abre el modal de confirmación para eliminar
    const handleOpenConfirmDelete = (oficio) => {
        setItemToDelete(oficio);
        setShowConfirmModal(true);
    };

    // 💡 NUEVA FUNCIÓN: Cierra el modal de confirmación
    const handleCloseConfirmDelete = () => {
        setShowConfirmModal(false);
        setItemToDelete(null);
    };

    // --- ELIMINAR OFICIO (handleDelete) - MODIFICADA para ser llamada desde el modal ---
    const handleDelete = async () => {
        // La información del oficio está en itemToDelete
        const { Id, Nombre } = itemToDelete;
        
        // 1. Cerramos el modal de confirmación
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

    if (loading) return <div className="container mt-4"><p>Cargando oficios...</p></div>;

    // Lógica para las propiedades del modal de confirmación
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
                <button 
                    className="btn btn-primary"
                    onClick={handleAddClick}
                >
                    ➕ Agregar Oficio
                </button>
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
                                    <button
                                        className="btn btn-sm btn-info me-2"
                                        onClick={() => handleEditClick(oficio)}
                                    >
                                        ✏️ Editar
                                    </button>
                                    <button
                                        className="btn btn-sm btn-danger"
                                        // 💡 Llamamos a la nueva función que abre el modal
                                        onClick={() => handleOpenConfirmDelete(oficio)}
                                    >
                                        🗑️ Eliminar
                                    </button>
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

            {/* 💡 RENDERIZAR EL MODAL DE CONFIRMACIÓN GENÉRICO */}
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