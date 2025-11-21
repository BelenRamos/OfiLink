import React, { useState, useCallback } from "react";
import CardSolicitudes from "../components/CardSolicitudes";
import { useAuth } from "../hooks/useAuth";
import SolicitudModal from "../components/SolicitudModal";
import useMisSolicitudes, { ESTADOS_SOLICITUD } from "../hooks/useMisSolicitudes"; 
import { Form, Row, Col, Alert, Spinner } from 'react-bootstrap'; 

const MisSolicitudes = () => {
  const { usuario, isLoading, tienePermiso, tieneRol } = useAuth(); 
  const [mostrarModal, setMostrarModal] = useState(false); 
  const [mensajeExito, setMensajeExito] = useState(null);
  
  const PERMISO_VER_VISTA = 'ver_mis_solicitudes';
  const PERMISO_CANCELAR = 'cancelar_solicitud';
  
  const {
    solicitudes, 
    loading,
    error,
    filtroEstado,
    setFiltroEstado,
    recargarSolicitudes, 
  } = useMisSolicitudes(tienePermiso, PERMISO_VER_VISTA);

  const handleFiltroEstadoChange = (event) => setFiltroEstado(event.target.value);
  
  const handleSolicitudCreada = useCallback((successData) => { 
    const message = successData?.mensaje || "¡Solicitud publicada con éxito!"; 
    setMensajeExito(message);
    setMostrarModal(false);
    recargarSolicitudes(); 
    setTimeout(() => {
      setMensajeExito(null);
    }, 5000); 
  }, [recargarSolicitudes]);

  if (isLoading || loading) return <div className="mt-4"><Spinner animation="border" size="sm" /> Cargando datos...</div>;

  if (!tienePermiso(PERMISO_VER_VISTA)) {
    return <h2 className="mt-4">No tienes permiso para acceder a "Mis Solicitudes".</h2>;
  }
  
  if (error) {
    return <Alert variant="danger" className="mt-4">Error al cargar solicitudes: {error}</Alert>;
  }

  const permisosTarjeta = {
    puedeCancelar: tienePermiso(PERMISO_CANCELAR),
    puedeTomar: false, // Es una vista de cliente, no puede tomar solicitudes
  };

  const puedePublicar = tieneRol('cliente');

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
      <h2 className="fw-bold">Mis Solicitudes</h2>
        {puedePublicar && (
          <button
            className="btn btn-primary"
            onClick={() => setMostrarModal(true)}
          >
            Publicar Solicitud
          </button>
        )}
      </div>
      {mensajeExito && (
        <Alert variant="success" onClose={() => setMensajeExito(null)} dismissible>
          {mensajeExito}
          </Alert>
        )}
      <Row className="mb-4 g-3">
          {/* Filtro por Estado */}
          <Col xs={12} md={4}>
              <Form.Group controlId="filtroEstado">
                  <Form.Label>Filtrar por Estado:</Form.Label>
                  <Form.Select 
                      value={filtroEstado} 
                      onChange={handleFiltroEstadoChange}
                  >
                      {ESTADOS_SOLICITUD.map(estado => (
                          <option key={estado} value={estado}>
                              {estado}
                          </option>
                      ))}
                  </Form.Select>
              </Form.Group>
          </Col>
      </Row>
      <hr />
      
      {solicitudes.length === 0 && (
          <p>
              {filtroEstado !== 'Todos' 
                  ? `No hay solicitudes que coincidan con el filtro.` 
                  : 'No tienes solicitudes aún. ¡Publica la primera!'}
          </p>
      )}

      <div className="solicitudes-list">
        {solicitudes.map((s) => (
          <CardSolicitudes 
            key={s.id}
            solicitud={s}
            usuario={usuario}
            onActualizar={recargarSolicitudes} 
            permisos={permisosTarjeta} 
          />
        ))}
      </div>
      
      {puedePublicar && (
        <SolicitudModal
          show={mostrarModal}
          onClose={() => setMostrarModal(false)}
          onSolicitudCreada={handleSolicitudCreada} 
        />
      )}
    </div>
  );
};

export default MisSolicitudes;