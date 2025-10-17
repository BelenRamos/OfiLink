import React, { useState, useEffect } from 'react';

const ConfirmBlockModal = ({ 
    show, 
    onClose, 
    onConfirm, 
    title, 
    message, 
    confirmText, 
    confirmButtonClass = 'btn-primary',
    inputLabel = 'Motivo',
    isInputRequired = true 
}) => {
    const [inputValue, setInputValue] = useState('');

    // Resetea el input cada vez que el modal se abre
    useEffect(() => {
        if (show) {
            setInputValue('');
        }
    }, [show]);

    const handleConfirm = () => {
        if (isInputRequired && !inputValue.trim()) {
            alert(`El campo "${inputLabel}" es obligatorio.`);
            return;
        }
        // Llama a la función de confirmación pasando el valor del input
        onConfirm(inputValue.trim());
        setInputValue('');
    };

    if (!show) {
        return null;
    }

    return (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">{title}</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        <p>{message}</p>
                        <div className="mb-3">
                            <label htmlFor="modalInput" className="form-label">{inputLabel}</label>
                            <textarea 
                                id="modalInput"
                                className="form-control"
                                rows="3"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Cancelar
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

export default ConfirmBlockModal;