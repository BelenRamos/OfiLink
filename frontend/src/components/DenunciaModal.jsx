import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";

const DenunciaModal = ({ show, onHide, trabajadorId, usuario, onDenunciaCreada }) => {
  const [motivo, setMotivo] = useState("");
  const [loading, setLoading] = useState(false);
  const handleHide = typeof onHide === "function" ? onHide : () => {};

  const handleEnviar = async (e) => {
    e.preventDefault();
    if (!motivo.trim()) {
      alert("Por favor, escribí el motivo de la denuncia.");
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

      alert("Denuncia enviada correctamente.");
      setMotivo("");
      handleHide();
      if (onDenunciaCreada) onDenunciaCreada();

    } catch (error) {
      console.error("Error al enviar denuncia:", error);
      alert(error.message);
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
