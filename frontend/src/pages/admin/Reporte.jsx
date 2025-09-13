import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';

const Reporte = () => {
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rolFiltro, setRolFiltro] = useState('todos'); // Nuevo estado para el filtro
  const printRef = useRef();

  useEffect(() => {
    const fetchDatos = async () => {
      setLoading(true); // Se inicia la carga
      try {
        const { data } = await axios.get('/api/personas/reporte', {
          params: { rol: rolFiltro } // Envía el rol como parámetro de consulta
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
  }, [rolFiltro]); // El efecto se ejecuta cada vez que el filtro cambie

  const imprimir = () => {
    const contenido = printRef.current.innerHTML;
    const ventana = window.open('', '', 'width=800,height=600');
    ventana.document.write(`
      <html>
        <head>
          <title>Reporte</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; }
          </style>
        </head>
        <body>
          ${contenido}
        </body>
      </html>
    `);
    ventana.document.close();
    ventana.print();
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
                <th>Rol</th> {/* Se cambió para mostrar el rol */}
              </tr>
            </thead>
            <tbody>
              {datos.map((d) => (
                <tr key={d.id}>
                  <td>{d.id}</td>
                  <td>{d.nombre}</td>
                  <td>{d.rol}</td> {/* Se cambió para mostrar el rol */}
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