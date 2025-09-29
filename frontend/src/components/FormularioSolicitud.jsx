import { useState, useEffect } from "react";
import OficiosSelector from "./OficiosSelector";
import { apiFetch } from "../utils/apiFetch";

const FormularioSolicitud = ({ onSubmit, cargando }) => {
  const [oficiosSeleccionados, setOficiosSeleccionados] = useState([]);
  const [oficios, setOficios] = useState([]);
  const [descripcion, setDescripcion] = useState("");
  const [fechaTentativa, setFechaTentativa] = useState("");

  useEffect(() => {
    const cargarOficios = async () => {
      try {
        const data = await apiFetch("/api/oficios");
        setOficios(data);
      } catch (err) {
        console.error("Error al cargar oficios:", err);
      }
    };
    cargarOficios();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
        oficios: oficiosSeleccionados, 
        descripcion_trabajo: descripcion,
        fecha: fechaTentativa,
    };
    
    onSubmit(payload).then(() => {
        // Resetear estados solo si la solicitud fue exitosa
        setOficiosSeleccionados([]);
        setDescripcion("");
        setFechaTentativa("");
    })
    .catch(error => {
        console.error("Error en el envío del formulario:", error);
    });
  };

  return (
    <form onSubmit={handleSubmit}>
    <OficiosSelector
      oficios={oficios}
      oficiosSeleccionados={oficiosSeleccionados}
      setOficiosSeleccionados={setOficiosSeleccionados}
    />

      <div className="form-group mt-3">
        <label htmlFor="descripcion">Descripción</label>
        <textarea
          id="descripcion"
          className="form-control"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          required
        />
      </div>

      <div className="form-group mt-3">
          <label htmlFor="fechaTentativa">Fecha tentativa</label>
          <input
              type="date"
              id="fechaTentativa"
              className="form-control"
              value={fechaTentativa}
              onChange={(e) => setFechaTentativa(e.target.value)}
              required
          />
      </div>

      <button type="submit" className="btn btn-success mt-3" disabled={cargando}>
        {cargando ? "Publicando..." : "Publicar Solicitud"}
      </button>
    </form>
  );
};

export default FormularioSolicitud;
