import React, { useState } from "react";
import { Modal, Button, Alert } from "react-bootstrap"; // Importado Alert
import ResenaForm from "./FormularioResena";
import { apiFetch } from "../utils/apiFetch";

const ResenaModal = ({ show, onHide, contratacionId, trabajadorId, onResenaCreada }) => {
    const [loading, setLoading] = useState(false);
    const [errorApi, setErrorApi] = useState(null); 
    
    const handleHide = () => {
        setErrorApi(null); 
        if (typeof onHide === 'function') {
            onHide();
        }
    };
    
    const handleGuardar = async (formData) => {
        setErrorApi(null); 
        try {
            setLoading(true);
            await apiFetch("/api/resenas", {
                method: "POST",
                body: {
                    comentario: formData.comentario,
                    puntuacion: formData.puntuacion,
                    contratacionId,
                },
            });
            handleHide(); 

            if (onResenaCreada) {
                onResenaCreada();
            }

        } catch (error) {
            console.error("Error al guardar reseña:", error.message);
            setErrorApi(error.message); 
        } finally {
            setLoading(false);
        }
    };


    return (
        <Modal show={show} onHide={handleHide} backdrop="static" keyboard={true}>
            <Modal.Header closeButton>
                <Modal.Title>Escribir Reseña</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {/* Mostrar mensaje de error de la API si existe */}
                {errorApi && (
                    <Alert variant="danger" onClose={() => setErrorApi(null)} dismissible>
                        {errorApi}
                    </Alert>
                )}

                <ResenaForm onSubmit={handleGuardar} cargando={loading} />
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleHide} disabled={loading}>
                    Cancelar
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ResenaModal;