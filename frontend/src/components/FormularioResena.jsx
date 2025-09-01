import React, { useState } from "react";
import { Form } from "react-bootstrap";

const FormularioReseña = ({ onSubmit, cargando }) => {
  const [comentario, setComentario] = useState("");
  const [puntuacion, setpuntuacion] = useState(5);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!comentario.trim()) {
      alert("Debe ingresar un comentario");
      return;
    }
    onSubmit({ comentario, puntuacion });
    setComentario("");
    setpuntuacion(5);
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-3">
        <Form.Label>Calificación</Form.Label>
        <Form.Select
          value={puntuacion}
          onChange={(e) => setpuntuacion(parseInt(e.target.value))}
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
          onChange={(e) => setComentario(e.target.value)}
          placeholder="Escriba su opinión sobre el trabajador..."
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
