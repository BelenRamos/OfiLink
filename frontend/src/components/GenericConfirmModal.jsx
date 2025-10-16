import React from 'react';

const GenericConfirmModal = ({ 
    show, 
    onClose, 
    onConfirm, 
    title, 
    message, 
    confirmText = "Aceptar", 
    cancelText = "Cancelar",
    confirmButtonClass = "btn-danger" // Clase por defecto para la acción
}) => {
    if (!show) return null;

    const handleConfirm = () => {
        onConfirm(); // Ejecuta la función de acción pasada por props
        onClose();   // Cierra el modal
    };

    return (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className={`modal-header ${confirmButtonClass.includes('danger') ? 'bg-warning text-dark' : 'bg-info text-dark'}`}>
                        <h5 className="modal-title">{title}</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        <p>{message}</p>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            {cancelText}
                        </button>
                        <button 
                            type="button" 
                            className={`btn ${confirmButtonClass}`} 
                            onClick={handleConfirm}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GenericConfirmModal;