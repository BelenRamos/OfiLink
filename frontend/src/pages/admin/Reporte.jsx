import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';

const Reporte = () => {
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const printRef = useRef();

  useEffect(() => {
    const fetchDatos = async () => {
      try {
        const { data } = await axios.get('/api/personas/reporte');
        setDatos(data);
      } catch (err) {
        console.error('Error al obtener reporte:', err);
        setError('No se pudo cargar el reporte');
      } finally {
        setLoading(false);
      }
    };

    fetchDatos();
  }, []);

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
      <button
        className="btn btn-success mb-3"
        onClick={imprimir}
        disabled={loading || datos.length === 0}
      >
        🖨️ Imprimir
      </button>

      {loading && <p>Cargando datos...</p>}
      {error && <p className="text-danger">{error}</p>}

      {!loading && !error && (
        <div ref={printRef}>
          <table className="table table-bordered table-striped">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Oficio</th>
                <th>Zona</th>
              </tr>
            </thead>
            <tbody>
              {datos.map((d) => (
                <tr key={d.id}>
                  <td>{d.id}</td>
                  <td>{d.nombre}</td>
                  <td>{d.oficio}</td>
                  <td>{d.zona}</td>
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
