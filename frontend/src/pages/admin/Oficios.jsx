import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import useOficios from '../../hooks/seguridad/useOficios'; 
import OficioModal from '../../components/OficioModal';
import GenericConfirmModal from '../../components/GenericConfirmModal'; 
import TablaOficios from '../../components/TablaOficios'; 

const Oficios = () => {
    const authContext = useAuth();
    
    const {
        oficios,
        mensaje,
        loading,
        showModal,
        currentOficio,
        showConfirmModal,
        handleAddClick,
        handleEditClick,
        handleCloseModal,
        handleOpenConfirmDelete,
        handleCloseConfirmDelete,
        handleSaveOficio,
        handleDelete,
        puedeVer,
        puedeCrear,
        puedeEditar,
        puedeEliminar,
        isLoadingAuth,
        deleteModalProps,
    } = useOficios(authContext);

    if (isLoadingAuth || loading) return <div className="container mt-4"><p>Cargando permisos y oficios...</p></div>;

    if (!puedeVer) {
        return <h2 className="container mt-4 text-danger">No tienes permiso para ver la gestión de oficios.</h2>;
    }

    return (
        <div className="container mt-4">
            <h2>Gestión de Oficios 🛠️</h2>
            {mensaje && <div className="alert alert-info">{mensaje}</div>}

            <div className="d-flex justify-content-end mb-3">
                {puedeCrear && (
                    <button 
                    className="btn btn-primary"
                    onClick={handleAddClick}
                    >
                        ➕ Agregar Oficio
                    </button>
                )}
            </div>
            
            {/* TABLA DE OFICIOS */}
            <TablaOficios
                oficios={oficios}
                puedeEditar={puedeEditar}
                puedeEliminar={puedeEliminar}
                handleEditClick={handleEditClick}
                handleOpenConfirmDelete={handleOpenConfirmDelete}
            />

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
                    onConfirm={handleDelete} 
                    {...deleteModalProps} 
                />
            )}
        </div>
    );
};

export default Oficios;