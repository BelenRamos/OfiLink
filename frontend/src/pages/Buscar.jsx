import CardTrabajador from '../components/CardTrabajador';
import FiltroTrabajadores from '../components/FiltroTrabajadores';
import { useAuth } from '../hooks/useAuth';
import useBuscarTrabajadores from '../hooks/useBuscar'; 

const Buscar = () => {
  // Usar useAuth para el permiso
  const { tienePermiso } = useAuth();
  const PERMISO_VER_BUSCAR = 'ver_buscar';

  const { 
    trabajadores,
    loading,
    error,
    oficio,
    setOficio,
    zona,
    setZona,
    calificacion,
    setCalificacion,
  } = useBuscarTrabajadores(tienePermiso, PERMISO_VER_BUSCAR);


  return (
    <div className="container mt-4">
      <h2 className="mb-3">Buscar trabajadores</h2>

      <FiltroTrabajadores 
        oficio={oficio} 
        setOficio={setOficio} 
        zona={zona} 
        setZona={setZona}
        calificacion={calificacion} 
        setCalificacion={setCalificacion} 
      />

      <div className="row">
        {loading && <p>Cargando trabajadores...</p>}
        {error && <p className="alert alert-danger">Error: {error}</p>}

        {(!loading && !error && trabajadores.length > 0) ? (
          trabajadores.map(trabajador => (
            <div key={trabajador.id} className="col-md-6 mb-4">
              <CardTrabajador trabajador={trabajador} />
            </div>
          ))
        ) : (!loading && !error && (
          <p>No se encontraron trabajadores para esos filtros.</p>
        ))}
      </div>
    </div>
  );
};

export default Buscar;