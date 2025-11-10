import React, { useRef } from 'react';
import { useAuth } from "../../hooks/useAuth";
import useReporte from "../../hooks/seguridad/useReporte"; 
import { imprimirHTML } from "../../utils/imprimirHTML";
import ReporteTabla from "../../components/TablaReporte"; 

const Reporte = () => {
  const authContext = useAuth();
  const printRef = useRef();
  
  const { 
    datos,
    loading,
    error,
    rolFiltro,
    setRolFiltro,
    imprimir,
    puedeVer,
    isLoadingAuth,
  } = useReporte(authContext);

  const handleImprimir = () => {
    // 1. Verificar si el hook permite la impresión (chequeo de permiso)
    const canPrint = imprimir(); 
    if (!canPrint) return; 

    // 2. Ejecutar la impresión si tiene permiso
    if (printRef.current) {
      imprimirHTML(printRef.current.innerHTML, `Reporte de Usuarios - Rol: ${rolFiltro}`);
    }
  };

  if (isLoadingAuth) return <div className="container mt-4"><p>Cargando permisos...</p></div>;

  if (!puedeVer) {
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
          onClick={handleImprimir}
          disabled={loading || datos.length === 0}
        >
          🖨️ Imprimir
        </button>
      </div>

      {loading && <p>Cargando datos...</p>}
      {error && <p className="alert alert-danger">{error}</p>}

      {!loading && !error && (
        <ReporteTabla
            datos={datos}
            loading={loading}
            error={error}
            printRef={printRef}
        />
      )}
    </div>
  );
};

export default Reporte;