import React, { useState } from 'react';
import trabajadoresMock from '../data/trabajadores.json';
import CardTrabajador from '../components/CardTrabajador';
import FiltroTrabajadores from '../components/FiltroTrabajadores';

const Buscar = () => {
  const [oficio, setOficio] = useState('');
  const [zona, setZona] = useState('');

  const trabajadoresFiltrados = trabajadoresMock.filter(t => {
    const matchOficio = oficio ? t.oficio.toLowerCase().includes(oficio.toLowerCase()) : true;
    const matchZona = zona ? t.zona === zona : true;
    return matchOficio && matchZona;
  });

  return (
    <div className="container mt-4">
      <h2 className="mb-3">Buscar trabajadores</h2>

      <FiltroTrabajadores oficio={oficio} setOficio={setOficio} zona={zona} setZona={setZona} />

      <div className="row">
        {trabajadoresFiltrados.length > 0 ? (
          trabajadoresFiltrados.map(trabajador => (
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
