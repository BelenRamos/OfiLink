import { useEffect, useState } from 'react';
import CardTrabajador from '../components/CardTrabajador';
import FiltroTrabajadores from '../components/FiltroTrabajadores';
import { useAuth } from '../hooks/useAuth';

const Buscar = () => {
  const [oficio, setOficio] = useState('');
  const [zona, setZona] = useState('');
  const [trabajadores, setTrabajadores] = useState([]);
  const { tienePermiso } = useAuth();
  const PERMISO_VER_BUSCAR = 'ver_buscar';

useEffect(() => {
  if (!tienePermiso(PERMISO_VER_BUSCAR)) {
      return;
    }

  const fetchTrabajadores = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (oficio) queryParams.append('oficio', oficio);
      if (zona) queryParams.append('zona', zona);

      const res = await fetch(`/api/trabajadores?${queryParams.toString()}`);
      const data = await res.json();
      console.log('Trabajadores filtrados:', data);
      setTrabajadores(data);
    } catch (error) {
      console.error('Error al obtener trabajadores:', error);
    }
  };

  fetchTrabajadores();
}, [oficio, zona, tienePermiso]); 

  return (
    <div className="container mt-4">
      <h2 className="mb-3">Buscar trabajadores</h2>

      <FiltroTrabajadores oficio={oficio} setOficio={setOficio} zona={zona} setZona={setZona} />

      <div className="row">
        {trabajadores.length > 0 ? (
          trabajadores.map(trabajador => (
            <div key={trabajador.id} className="col-md-6 mb-4">
              <CardTrabajador trabajador={trabajador} />
            </div>
          ))
        ) : (
          <p>No se encontraron trabajadores para esos filtros.</p>
        )}
      </div>
    </div>
  );
};

export default Buscar;
