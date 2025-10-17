import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { imprimirHTML } from "../../utils/imprimirHTML";

const Reporte = () => {
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rolFiltro, setRolFiltro] = useState('todos'); 
  const printRef = useRef();

  useEffect(() => {
    const fetchDatos = async () => {
      setLoading(true); 
      try {
        const { data } = await axios.get('/api/personas/reporte', {
          params: { rol: rolFiltro } 
        });
        setDatos(data);
      } catch (err) {
        console.error('Error al obtener reporte:', err);
        setError('No se pudo cargar el reporte');
      } finally {
        setLoading(false);
      }
    };

    fetchDatos();
  }, [rolFiltro]); 

  const imprimir = () => {
    if (printRef.current) {
      imprimirHTML(printRef.current.innerHTML, "Historial de Auditoría");
    }
  };

  return (
    <div>
      <h3>Generar Reporte</h3>
      <div className="d-flex align-items-center mb-3">
        <label htmlFor="filtroRol" className="me-2">Filtrar por rol:</label>
        <select
          id="filtroRol"
          className="form-select w-auto me-3"
          value={rolFiltro}
          onChange={(e) => setRolFiltro(e.target.value)}
        >
          <option value="todos">Todos</option>
          <option value="administrador">Administradores</option>
          <option value="supervisor">Supervisores</option>
          <option value="cliente">Clientes</option>
          <option value="trabajador">Trabajadores</option>
        </select>

        <button
          className="btn btn-success"
          onClick={imprimir}
          disabled={loading || datos.length === 0}
        >
          🖨️ Imprimir
        </button>
      </div>

      {loading && <p>Cargando datos...</p>}
      {error && <p className="text-danger">{error}</p>}

      {!loading && !error && (
        <div ref={printRef}>
          <table className="table table-bordered table-striped">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Rol</th> 
              </tr>
            </thead>
            <tbody>
              {datos.map((d) => (
                <tr key={d.id}>
                  <td>{d.id}</td>
                  <td>{d.nombre}</td>
                  <td>{d.rol}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Reporte;