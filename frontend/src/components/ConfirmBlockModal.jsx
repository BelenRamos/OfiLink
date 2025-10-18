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
    isInputRequired = true,
    // 💡 NUEVA PROP: Array de objetos { value: 'X', label: 'Y' }
    durations 
}) => {
    const [motivo, setMotivo] = useState('');
    // 💡 NUEVO ESTADO: Inicializa con el primer valor de la lista o 'indefinido' si la lista está vacía
    const [selectedDuration, setSelectedDuration] = useState(durations?.[0]?.value || 'indefinido'); 

    // Resetea el input y la duración cada vez que el modal se abre
    useEffect(() => {
        if (show) {
            setMotivo('');
            // Resetea a la primera opción disponible
            setSelectedDuration(durations?.[0]?.value || 'indefinido'); 
        }
    }, [show, durations]);

    const handleConfirm = () => {
        // Validación: El motivo sigue siendo obligatorio
        if (isInputRequired && !motivo.trim()) {
            alert(`El campo "${inputLabel}" es obligatorio.`);
            return;
        }
        
        // 💡 CRÍTICO: Llama a la función de confirmación pasando el motivo Y la duración
        onConfirm(motivo.trim(), selectedDuration);
        
        // Limpia estados
        setMotivo('');
        setSelectedDuration(durations?.[0]?.value || 'indefinido');
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
                        
                        {/* 💡 NUEVO SELECTOR DE DURACIÓN */}
                        <div className="mb-3">
                            <label htmlFor="durationSelect" className="form-label">Duración del Bloqueo</label>
                            <select 
                                id="durationSelect"
                                className="form-select" 
                                value={selectedDuration}
                                onChange={(e) => setSelectedDuration(e.target.value)}
                            >
                                {durations && durations.map(d => (
                                     <option key={d.value} value={d.value}>{d.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* INPUT DE MOTIVO (Adaptado para usar 'motivo' en lugar de 'inputValue') */}
                        <div className="mb-3">
                            <label htmlFor="modalInput" className="form-label">{inputLabel}</label>
                            <textarea 
                                id="modalInput"
                                className="form-control"
                                rows="3"
                                value={motivo}
                                onChange={(e) => setMotivo(e.target.value)}
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