import React, { useState } from "react";
import { Modal, Button } from "react-bootstrap";
import ResenaForm from "./FormularioResena";

const ResenaModal = ({ show, onHide, contratacionId, trabajadorId, onResenaCreada }) => {
  const [loading, setLoading] = useState(false);
  const handleHide = typeof onHide === 'function' ? onHide : () => {};

  const handleGuardar = async (formData) => {
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
        throw new Error(error.error || "Error al guardar la reseña");
      }

      alert("Reseña guardada con éxito");
      handleHide(); // Cierra el modal
      if (onResenaCreada) {
        onResenaCreada();
      }

    } catch (error) {
      console.error(error);
      alert(error.message);
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
        <ResenaForm onSubmit={handleGuardar} loading={loading} />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleHide}>
          Cancelar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ResenaModal;