import React from 'react';

const ModalResenaPendiente = ({ show, handleClose, handleFiltrar, count }) => { 
    if (!show) return null;

    return (
        <div 
            className="modal d-block"
            role="dialog"
            aria-modal="true"
            tabIndex="-1"
            style={{
                backgroundColor: "rgba(0,0,0,0.35)", 
            }}
        >
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content shadow-lg" style={{ borderRadius: "12px" }}>

                    {/* Encabezado */}
                    <div 
                        className="modal-header"
                        style={{ 
                            backgroundColor: "#f7f7f7",
                            borderBottom: "1px solid #e3e3e3",
                        }}
                    >
                        <h5 className="modal-title fw-semibold">
                            🔔 Reseñas Pendientes
                        </h5>
                        <button 
                            type="button" 
                            className="btn-close" 
                            onClick={handleClose} 
                            aria-label="Cerrar"
                        />
                    </div>

                    {/* Cuerpo */}
                    <div className="modal-body text-center px-4">
                        <h4 className="fw-bold mb-3">
                            Tienes {count} contratació{count > 1 ? 'nes' : 'n'} finalizada{count > 1 ? 's' : ''}.
                        </h4>

                        <p className="lead" style={{ fontSize: "1.05rem" }}>
                            Ayúdanos a mejorar la comunidad dejando tu reseña.  
                            ¡Tu opinión es importante para que otros usuarios puedan elegir con confianza!
                        </p>
                    </div>

                    {/* Footer */}
                    <div className="modal-footer justify-content-center pb-4">

                        {/* Botón principal */}
                        <button
                            className="btn fw-bold"
                            style={{
                                backgroundColor: "rgb(212, 226, 113)",  // amarillo verdoso
                                color: "#2d3035",
                                padding: "8px 18px",
                                borderRadius: "6px",
                                border: "none"
                            }}
                            onClick={handleFiltrar}
                        >
                            Ir a mis Contrataciones
                        </button>

                        {/* Botón secundario */}
                        <button
                            type="button"
                            className="btn"
                            style={{
                                border: "2px solid rgb(205, 148, 193)", // rosa
                                color: "rgb(205, 148, 193)",
                                padding: "8px 16px",
                                borderRadius: "6px",
                            }}
                            onClick={handleClose}
                        >
                            Dejar para después
                        </button>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModalResenaPendiente;
