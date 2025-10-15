import { useState, useEffect } from 'react';
import { apiFetch } from '../../utils/apiFetch'; 
import OficioModal from '../../components/OficioModal';

const Oficios = () => {
    const [oficios, setOficios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mensaje, setMensaje] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [currentOficio, setCurrentOficio] = useState(null); 

    const API_BASE_URL = '/api/oficios';

    useEffect(() => {
        fetchOficios();
    }, []);

    const fetchOficios = async () => {
        setLoading(true);
        try {
            const response = await apiFetch(API_BASE_URL);
            setOficios(response);
            setMensaje('');
        } catch (error) {
            console.error('Error al cargar oficios:', error);
            setMensaje('Error al cargar la lista de oficios.');
        } finally {
            setLoading(false);
        }
    };
    
    const handleAddClick = () => {
        setCurrentOficio(null); // Modo Agregar (oficio nulo)
        setShowModal(true);
    };

    const handleEditClick = (oficio) => {
        setCurrentOficio(oficio); // Modo Editar (oficio con datos)
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setCurrentOficio(null); // Limpiar el estado del oficio actual
    };

    const handleSaveOficio = async (oficioData) => {
        const isEdit = !!currentOficio;
        const url = isEdit ? `${API_BASE_URL}/${currentOficio.Id}` : API_BASE_URL;
        const method = isEdit ? 'PUT' : 'POST';

        try {
            await apiFetch(url, {
                method: method,
                body: oficioData
            });
            
            setMensaje(`Oficio ${isEdit ? 'actualizado' : 'agregado'} con éxito.`);
            handleCloseModal();
            fetchOficios(); 

        } catch (error) {
            console.error(`Error al ${isEdit ? 'actualizar' : 'agregar'} oficio:`, error.message);
            setMensaje(`Error al guardar el oficio: ${error.message}`);
        }
    };

    // --- ELIMINAR OFICIO ---

    const handleDelete = async (id, nombre) => {
        if (!window.confirm(`⚠️ ¿Está seguro de que desea eliminar el oficio "${nombre}"? Esta acción eliminará registros en Trabajador_Oficio.`)) {
            return;
        }

        try {
            await apiFetch(`${API_BASE_URL}/${id}`, {
                method: 'DELETE'
            });
            
            setMensaje(`Oficio "${nombre}" eliminado con éxito.`);
            fetchOficios(); 

        } catch (error) {

        const errorBody = error.response || {}; 
        const errorMessage = errorBody.error || "Error inesperado al eliminar el oficio.";
        
        const fullMessage = errorMessage + (errorBody.details ? ` (${errorBody.details})` : '');

        console.error("Error al eliminar:", error);
        
        setMensaje(fullMessage);
        }
    };

    if (loading) return <div className="container mt-4"><p>Cargando oficios...</p></div>;

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
                                        onClick={() => handleDelete(oficio.Id, oficio.Nombre)}
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
        </div>
    );
};

export default Oficios;