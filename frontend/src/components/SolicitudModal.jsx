import { useState } from "react";
import { Modal, Alert } from "react-bootstrap"; // Importado Alert
import { apiFetch } from "../utils/apiFetch";
import FormularioSolicitud from "./FormularioSolicitud";

const SolicitudModal = ({ show, onClose, onSolicitudCreada }) => {
  const [cargando, setCargando] = useState(false);
  const [errorApi, setErrorApi] = useState(null); 

  const handleClose = () => {
    setErrorApi(null);
    onClose();
  };

  const handleSubmit = async (payload) => {
    setCargando(true);
    setErrorApi(null); 
    try {
      await apiFetch("/api/solicitudes", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      
      // La función onSolicitudCreada debe notificar el éxito al componente padre
      onSolicitudCreada('success', 'Solicitud publicada con éxito. Espera la respuesta de un trabajador.');
      
      handleClose(); 
    } catch (err) {
      console.error("Error al publicar solicitud:", err);
      
      const defaultMessage = "Ocurrió un error inesperado al publicar la solicitud.";
      const errorMessage = err.response?.error || defaultMessage;
      setErrorApi(errorMessage);

    } finally {
      setCargando(false);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Nueva Solicitud</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {errorApi && (
            <Alert variant="danger" onClose={() => setErrorApi(null)} dismissible>
                {errorApi}
            </Alert>
        )}

        <FormularioSolicitud onSubmit={handleSubmit} cargando={cargando} />
      </Modal.Body>
    </Modal>
  );
};

export default SolicitudModal;