import React from "react";
import { useAuth } from "../../hooks/useAuth"; 
import useContratacionesList from "../../hooks/seguridad/useContrataciones"; 
import ContratacionesTable from "../../components/TablaContrataciones"; 

const Contrataciones = () => {
  const authContext = useAuth();
    
  const {
    contrataciones, 
    todasContrataciones, 
    filtroEstado,
    setFiltroEstado,
    error,
    puedeVer,
    isLoadingAuth,
  } = useContratacionesList(authContext);

  // --- Lógica de Renderizado de Control de Acceso ---

  if (isLoadingAuth) return <p className="mt-4">Cargando permisos...</p>;

  if (!puedeVer) {
    return <h2 className="mt-4 text-danger">No tienes permiso para ver el listado de contrataciones.</h2>;
  }

  // --- Renderizado de la UI ---
  return (
    <div className="container mt-4">
      <h3>Contrataciones</h3>
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="mb-3 d-flex gap-3 align-items-center">
        <label>Filtrar por estado:</label>
        <select
          className="form-select w-auto"
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
        >
          <option value="">Todas</option>
          <option value="Aceptada">Aceptada</option>
          <option value="en curso">En curso</option>
          <option value="finalizada">Finalizada</option>
          <option value="cancelada">Cancelada</option>
        </select>
      </div>

      <ContratacionesTable 
          contrataciones={contrataciones} 
          todasContrataciones={todasContrataciones} 
          error={error} 
      />
    </div>
  );
};

export default Contrataciones;