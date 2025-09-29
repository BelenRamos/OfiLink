import { useState } from "react";
import { Modal } from "react-bootstrap";
import { apiFetch } from "../utils/apiFetch";
import FormularioSolicitud from "./FormularioSolicitud";

const SolicitudModal = ({ show, onClose, onSolicitudCreada }) => {
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (payload) => {
    setCargando(true);
    try {
      await apiFetch("/api/solicitudes", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      onSolicitudCreada();
      onClose();
    } catch (err) {
      console.error("Error al publicar solicitud:", err);
      alert("Error al publicar la solicitud");
    } finally {
      setCargando(false);
    }
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Nueva Solicitud</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <FormularioSolicitud onSubmit={handleSubmit} cargando={cargando} />
      </Modal.Body>
    </Modal>
  );
};

export default SolicitudModal;
