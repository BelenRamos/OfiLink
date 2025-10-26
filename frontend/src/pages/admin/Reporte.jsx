import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { imprimirHTML } from "../../utils/imprimirHTML";
import { useAuth } from "../../hooks/useAuth";

const Reporte = () => {
  const { tienePermiso, isLoading } = useAuth();
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rolFiltro, setRolFiltro] = useState('todos'); 
  const printRef = useRef();

  const PERMISO_VER_REPORTE = 'ver_reporte';

  useEffect(() => {
    if (isLoading) return;

    if (!tienePermiso(PERMISO_VER_REPORTE)) {
      setLoading(false);
      setError('No tienes permiso para ver el reporte.');
      return;
    }

    const fetchDatos = async () => {
      setLoading(true); 
      setError(''); // Limpiar errores anteriores antes de la nueva carga
      try {
        const { data } = await axios.get('/api/personas/reporte', {
          params: { rol: rolFiltro } 
        });
        setDatos(data);
      } catch (err) {
        console.error('Error al obtener reporte:', err);
        const errorMessage = err.response?.data?.error || 'No se pudo cargar el reporte.';
        setError(errorMessage);
        setDatos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDatos();
  }, [rolFiltro, isLoading, tienePermiso]);

  const imprimir = () => {
    if (printRef.current) {
      if (!tienePermiso(PERMISO_VER_REPORTE)) {
          setError('No tienes permiso para imprimir el reporte.');
          return;
      }
      imprimirHTML(printRef.current.innerHTML, "Reporte de Usuarios");
    }
  };

  if (isLoading) return <div className="container mt-4"><p>Cargando permisos...</p></div>;
  if (!tienePermiso(PERMISO_VER_REPORTE)) {
      return <h2 className="container mt-4 text-danger">No tienes permiso para ver este reporte.</h2>;
  }
  
  return (
    <div className="container mt-4">
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
      {error && <p className="alert alert-danger">{error}</p>}

      {!loading && !error && (
        <div ref={printRef}>
          {datos.length === 0 ? (
              <p>No se encontraron datos para el filtro seleccionado.</p>
          ) : (
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
          )}
        </div>
      )}
    </div>
  );
};

export default Reporte;