import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { apiFetch } from '../../utils/apiFetch';

const Denuncias = () => {
  const { tienePermiso, isLoading } = useAuth();
  const [denuncias, setDenuncias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const PERMISO_VER_DENUNCIAS = 'ver_denuncias';

  const cargarDenuncias = async () => {
    if (!tienePermiso(PERMISO_VER_DENUNCIAS)) {
        setError("No tiene permiso para ver el listado de denuncias.");
        setLoading(false);
        return;
    }

    try {
      const data = await apiFetch('/api/denuncias'); 
      setDenuncias(data);
      setError(null);
    } catch (err) {
      console.error('Error al obtener denuncias:', err);
      const errorMessage = err.response?.error || "Error al cargar las denuncias.";
      setError(errorMessage);
      setDenuncias([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoading) {
        if (tienePermiso(PERMISO_VER_DENUNCIAS)) {
            cargarDenuncias();
        } else {
            setLoading(false); // Detener la carga si el permiso no existe
        }
    }
  }, [isLoading, tienePermiso]);

  if (isLoading || loading) return <p className="mt-4">Cargando permisos y denuncias...</p>;

  if (!tienePermiso(PERMISO_VER_DENUNCIAS)) {
      return <h2 className="mt-4 text-danger">No tienes permiso para ver el listado de denuncias.</h2>;
  }

  return (
    <div className="container mt-4">
      <h3>Denuncias registradas</h3>
      <hr />
      {error && <div className="alert alert-danger">{error}</div>} 

      {denuncias.length === 0 && !error ? (
        <p>No hay denuncias registradas.</p>
      ) : (
        <table className="table table-striped">
          <thead>
            <tr>
              <th>ID</th>
              <th>Cliente</th>
              <th>Trabajador</th>
              <th>Motivo</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {denuncias.map((d) => (
              <tr key={d.id}>
                <td>{d.id}</td>
                <td>{d.nombre_cliente}</td>
                <td>{d.nombre_trabajador}</td>
                <td>{d.motivo}</td>
                <td>{new Date(d.fecha).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Denuncias;