import React, { useState, useEffect } from 'react';
import { Container, Alert, Spinner } from 'react-bootstrap';
import { apiFetch } from '../utils/apiFetch'; // Asegúrate de la ruta correcta
import CardContratacion from '../components/CardContrataciones';
import ResenaModal from '../components/ResenaModal';

const MisContrataciones = ({ usuario }) => {
  // Estado para la lista de contrataciones
  const [contrataciones, setContrataciones] = useState([]);
  // Estados para controlar el modal
  const [showResenaModal, setShowResenaModal] = useState(false);
  const [selectedContratacion, setSelectedContratacion] = useState(null);
  // Estados para la carga y errores
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Función para obtener las contrataciones desde la API
  const fetchContrataciones = async () => {
    try {
      setLoading(true);
      const url = `/api/contrataciones/usuario/${usuario.id}`;
      const data = await apiFetch(url);
      setContrataciones(data);
    } catch (err) {
      console.error("Error al obtener las contrataciones:", err);
      setError("No se pudieron cargar las contrataciones.");
    } finally {
      setLoading(false);
    }
  };

  // Se ejecuta una vez al cargar el componente para obtener los datos
  useEffect(() => {
    fetchContrataciones();
  }, [usuario.id]);

  // Funciones para abrir y cerrar el modal
  const handleOpenResenaModal = (contratacion) => {
    setSelectedContratacion(contratacion);
    setShowResenaModal(true);
  };

  const handleCloseResenaModal = () => {
    setShowResenaModal(false);
    setSelectedContratacion(null);
  };

  if (loading) {
    return (
      <Container className="my-5 text-center">
        <Spinner animation="border" />
        <p>Cargando contrataciones...</p>
      </Container>
    );
  }

  if (error) {
    return <Container className="my-5"><Alert variant="danger">{error}</Alert></Container>;
  }

  return (
    <Container className="my-4">
      <h2>Mis Contrataciones</h2>
      {contrataciones.length > 0 ? (
        contrataciones.map((contratacion) => (
          <CardContratacion
            key={contratacion.id}
            contratacion={contratacion}
            usuario={usuario}
            onActualizar={fetchContrataciones} // Para recargar la lista si se actualiza algo
            onResenaPendiente={() => handleOpenResenaModal(contratacion)}
          />
        ))
      ) : (
        <p>No tienes contrataciones aún.</p>
      )}

      {selectedContratacion && (
        <ResenaModal
          show={showResenaModal}
          onHide={handleCloseResenaModal}
          contratacionId={selectedContratacion.id}
          trabajadorId={selectedContratacion.trabajador_id} // Asume que tienes este ID
        />
      )}
    </Container>
  );
};

export default MisContrataciones;