import React from 'react';

/**
 * @param {object} props
 * @param {object|null} props.denuncia - La denuncia a mostrar (o null si está cerrado).
 * @param {function} props.onClose - Función para cerrar el modal.
 */
const DetalleDenunciaModal = ({ denuncia, onClose }) => {
    if (!denuncia) {
        return null; 
    }

    return (
        <div 
            className="modal d-block" 
            tabIndex="-1" 
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
            onClick={onClose} 
        >
            <div 
                className="modal-dialog modal-lg" 
                onClick={(e) => e.stopPropagation()} 
            >
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Detalle de la Denuncia ID: **{denuncia.id}**</h5>
                        <button type="button" className="btn-close" aria-label="Close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        
                        <div className="row mb-3">
                            <div className="col-md-6">
                                <p><strong>Cliente:</strong> {denuncia.nombre_cliente}</p>
                            </div>
                            <div className="col-md-6">
                                <p><strong>Trabajador Denunciado:</strong> {denuncia.nombre_trabajador}</p>
                            </div>
                        </div>

                        <p className="mb-2"><strong>Fecha de Denuncia:</strong> {new Date(denuncia.fecha).toLocaleDateString()}</p>
                        <hr />
                        
                        <p className="fw-bold">Motivo (Detalle Completo):</p>
                        <div className="alert alert-warning">
                            {denuncia.motivo}
                        </div>
                        
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cerrar</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetalleDenunciaModal;