import React from 'react';

const Dashboard = () => {
  // Estos datos pueden ser mockeados o calculados
  const resumen = {
    totalUsuarios: 35,
    totalTrabajadores: 20,
    totalClientes: 15,
    totalContrataciones: 48,
    totalOficios: 7
  };

  return (
    <div className="container mt-4">
      <h2>Panel de Administración</h2>
      <hr />
      <div className="row">
        {Object.entries(resumen).map(([key, value]) => (
          <div className="col-md-4 mb-3" key={key}>
            <div className="card bg-light text-center">
              <div className="card-body">
                <h5 className="card-title">{key.replace('total', '')}</h5>
                <p className="card-text display-6">{value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
    
  );
};

export default Dashboard;
