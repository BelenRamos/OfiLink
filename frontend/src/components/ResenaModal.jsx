import React, { useState } from "react";
import { Modal, Button, Alert } from "react-bootstrap"; // Importado Alert
import ResenaForm from "./FormularioResena";

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
            const response = await fetch("/api/resenas", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    comentario: formData.comentario,
                    puntuacion: formData.puntuacion,
                    contratacionId,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Error al guardar la reseña. Intenta de nuevo.");
            }            
            handleHide(); 

            if (onResenaCreada) {
                onResenaCreada();
            }

        } catch (error) {
            console.error(error);
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