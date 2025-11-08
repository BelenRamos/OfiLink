import React, { useState } from 'react';
import CardContratacion from '../components/CardContrataciones';
import ResenaModal from '../components/ResenaModal';
import { useAuth } from '../hooks/useAuth';
import useMisContrataciones, { ESTADOS_CONTRATACION } from '../hooks/useMisContrataciones';
import { Form, Row, Col, Alert, Spinner } from 'react-bootstrap'; 

const PERMISO_VER_CONTRATACIONES = "ver_mis_contrataciones";

const MisContrataciones = () => {
    const { usuario, tienePermiso, isLoading } = useAuth();
    const [contratacionSeleccionada, setContratacionSeleccionada] = useState(null);

    const {
        contrataciones,
        loading,
        error,
        filtroEstado,
        setFiltroEstado,
        filtroBusqueda,
        setFiltroBusqueda,
        recargarContrataciones, 
    } = useMisContrataciones(tienePermiso, PERMISO_VER_CONTRATACIONES);


    const handleCloseModal = () => { 
        setContratacionSeleccionada(null);
    };
    
    const handleFiltroEstadoChange = (event) => setFiltroEstado(event.target.value);
    const handleFiltroBusquedaChange = (event) => setFiltroBusqueda(event.target.value);

    const showModal = !!contratacionSeleccionada;

    const permisosTarjeta = {
        aceptar: !!tienePermiso('contratacion_aceptar'),
        cancelar: !!tienePermiso('contratacion_cancelar'), 
        resenar: !!tienePermiso('contratacion_resenar'),
        terminar: !!tienePermiso('contratacion_terminar'),
    };

    // --- Manejo de Estados de Carga y Permiso ---
    if (isLoading || loading) return <p><Spinner animation="border" size="sm" /> Cargando datos...</p>;

    if (!usuario || !tienePermiso(PERMISO_VER_CONTRATACIONES)) {
        return <h2 className="mt-4">No tienes permiso para ver Mis Contrataciones</h2>;
    }
    
    if (error) {
        return <Alert variant="danger" className="mt-4">Error: {error}</Alert>;
    }
    // ---------------------------------------------

    return (
        <div className="container mt-4">
            <h2>Mis Contrataciones</h2>

            {/* Controles de Filtro */}
            <Row className="mb-4 g-3">
                {/* Filtro por Estado */}
                <Col xs={12} md={4}>
                    <Form.Group controlId="filtroEstado">
                        <Form.Label>Filtrar por Estado:</Form.Label>
                        <Form.Select 
                            value={filtroEstado} 
                            onChange={handleFiltroEstadoChange}
                        >
                            {ESTADOS_CONTRATACION.map(estado => (
                                <option key={estado} value={estado}>
                                    {estado}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                </Col>

                {/* Filtro por Búsqueda de Texto */}
                <Col xs={12} md={8}>
                    <Form.Group controlId="filtroBusqueda">
                        <Form.Label>Buscar por Nombre/Descripción:</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Buscar por trabajador, cliente o descripción..."
                            value={filtroBusqueda}
                            onChange={handleFiltroBusquedaChange}
                        />
                    </Form.Group>
                </Col>
            </Row>
            
            <hr />

            {/* Mostrar resultados */}
            {contrataciones.length === 0 && (
                <p>
                    {filtroBusqueda || filtroEstado !== 'Todos' 
                        ? `No hay contrataciones que coincidan con los filtros.` 
                        : 'No hay contrataciones aún.'}
                </p>
            )}
            
            {contrataciones.map(c => (
                <CardContratacion
                    key={c.id}
                    contratacion={c}
                    usuario={usuario}
                    onActualizar={recargarContrataciones} 
                    onResenaPendiente={() => setContratacionSeleccionada(c)}
                    permisos={permisosTarjeta} 
                />
            ))}

            <ResenaModal
                show={showModal}
                onHide={handleCloseModal}
                contratacionId={contratacionSeleccionada?.id}
                trabajadorId={contratacionSeleccionada?.trabajador_id}
                onResenaCreada={recargarContrataciones} 
            />
        </div>
    );
};

export default MisContrataciones;