import React, { useState } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap"; // Importado Alert

const DenunciaModal = ({ show, onHide, trabajadorId, usuario, onDenunciaCreada }) => {
  const [motivo, setMotivo] = useState("");
  const [loading, setLoading] = useState(false);
  // Nuevo estado para manejar errores dentro del modal, en lugar de alert()
  const [errorLocal, setErrorLocal] = useState(""); 
  
  const handleHide = () => {
    // Limpiamos el estado al cerrar el modal
    setMotivo("");
    setErrorLocal("");
    // Llamamos a la función onHide pasada por props
    if (typeof onHide === "function") {
      onHide();
    }
  };

  const handleEnviar = async (e) => {
    e.preventDefault();
    setErrorLocal(""); // Limpiamos errores anteriores

    if (!motivo.trim()) {
      // ❌ REEMPLAZADO: alert("Por favor, escribí el motivo de la denuncia.")
      setErrorLocal("Por favor, escribí el motivo de la denuncia."); 
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/denuncias", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${usuario.token}`,
        },
        body: JSON.stringify({
          motivo,
          trabajador_id: trabajadorId,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Error al registrar la denuncia");

      // ❌ ELIMINADO: alert("Denuncia enviada correctamente."); 
      setMotivo(""); 
      handleHide(); // Cierra el modal, también limpia los estados

      // ✅ ESTA LLAMADA ACTIVA EL MENSAJE EN EL PADRE (PerfilTrabajador)
      if (onDenunciaCreada) onDenunciaCreada(); 

    } catch (error) {
      console.error("Error al enviar denuncia:", error);
      // ❌ REEMPLAZADO: alert(error.message);
      setErrorLocal(error.message); // Muestra el error en el modal
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={handleHide} backdrop="static" keyboard={true}>
      <Modal.Header closeButton>
        <Modal.Title>Denunciar trabajador</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleEnviar}>
        <Modal.Body>
          {/* Muestra el error localmente si existe */}
          {errorLocal && <Alert variant="danger">{errorLocal}</Alert>}
          
          <Form.Group className="mb-3">
            <Form.Label>Motivo de la denuncia</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Describí brevemente el motivo..."
              disabled={loading}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleHide} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" variant="danger" disabled={loading}>
            {loading ? "Enviando..." : "Enviar denuncia"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default DenunciaModal;