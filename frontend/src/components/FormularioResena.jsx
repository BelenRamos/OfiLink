import React, { useState } from "react";
import { Form, Alert } from "react-bootstrap"; 

const FormularioReseña = ({ onSubmit, cargando }) => {
    const [comentario, setComentario] = useState("");
    const [puntuacion, setPuntuacion] = useState(5); 
    const [errorValidacion, setErrorValidacion] = useState(""); 

    const handleSubmit = (e) => {
        e.preventDefault();
        setErrorValidacion(""); 

        if (!comentario.trim()) {
            setErrorValidacion("Debes ingresar un comentario para enviar la reseña.");
            return;
        }
        
        onSubmit({ comentario, puntuacion });
        setComentario(""); 
        setPuntuacion(5); 
    };
    
    const handleComentarioChange = (e) => {
        setComentario(e.target.value);
        if (errorValidacion) {
            setErrorValidacion(""); 
        }
    };

    return (
        <Form onSubmit={handleSubmit}>
            
            {/* Mostrar mensaje de error de validación */}
            {errorValidacion && <Alert variant="danger">{errorValidacion}</Alert>}
            
            <Form.Group className="mb-3">
                <Form.Label>Calificación</Form.Label>
                <Form.Select
                    value={puntuacion}
                    onChange={(e) => setPuntuacion(parseInt(e.target.value))}
                    disabled={cargando}
                >
                    <option value={5}>⭐⭐⭐⭐⭐</option>
                    <option value={4}>⭐⭐⭐⭐</option>
                    <option value={3}>⭐⭐⭐</option>
                    <option value={2}>⭐⭐</option>
                    <option value={1}>⭐</option>
                </Form.Select>
            </Form.Group>
            <Form.Group>
                <Form.Label>Comentario</Form.Label>
                <Form.Control
                    as="textarea"
                    rows={3}
                    value={comentario}
                    onChange={handleComentarioChange}
                    placeholder="Escriba su opinión sobre el trabajador..."
                    disabled={cargando}
                />
            </Form.Group>
            <div className="mt-3">
                <button type="submit" className="btn btn-primary" disabled={cargando}>
                    {cargando ? "Guardando..." : "Guardar"}
                </button>
            </div>
        </Form>
    );
};

export default FormularioReseña;