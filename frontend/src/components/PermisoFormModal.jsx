import React from 'react';
import FormularioPermiso from './FormularioPermiso'; 

const PermisoFormModal = ({ 
    show, 
    onClose, 
    permiso, 
    todosLosPermisos, 
    fetchPermisos, 
    setExito, 
    setError 
}) => {
    if (!show) return null;

    const modalTitle = permiso ? `Editar Permiso: ${permiso.Nombre}` : 'Crear Nuevo Permiso';

    return (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
                <div className="modal-content">
                    <div className="modal-header bg-primary text-white">
                        <h5 className="modal-title">{modalTitle}</h5>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        {/* 🔑 Delegamos la lógica principal al formulario */}
                        <FormularioPermiso
                            permiso={permiso}
                            todosLosPermisos={todosLosPermisos}
                            fetchPermisos={fetchPermisos}
                            setExito={setExito}
                            setError={setError}
                            closeModal={onClose} // Usamos onClose como closeModal
                        />
                    </div>
                    {/* El footer con los botones de guardar está dentro de FormularioPermiso */}
                </div>
            </div>
        </div>
    );
};

export default PermisoFormModal;