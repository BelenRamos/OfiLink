import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend, ResponsiveContainer
} from 'recharts';

const resumen = {
  totalUsuarios: 35,
  totalTrabajadores: 20,
  totalClientes: 15,
  totalContrataciones: 48,
  totalOficios: 7
};

const chartData = [
  { nombre: 'Trabajadores', valor: resumen.totalTrabajadores },
  { nombre: 'Clientes', valor: resumen.totalClientes },
  { nombre: 'Contrataciones', valor: resumen.totalContrataciones },
  { nombre: 'Oficios', valor: resumen.totalOficios }
];

// Datos para la torta (clientes + trabajadores)
const usuariosData = [
  { nombre: 'Clientes', valor: resumen.totalClientes },
  { nombre: 'Trabajadores', valor: resumen.totalTrabajadores },
];

const colores = ['#007bff', '#28a745', '#ffc107', '#dc3545'];

const Dashboard = () => {
  return (
    <div className="container mt-4">
      <h2>Panel de Administración</h2>
      <hr />

      <div className="row">
        {/* Gráfico de barras */}
        <div className="col-md-6 mb-4">
          <h5 className="text-center">Resumen en Barras</h5>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nombre" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="valor" fill="#007bff" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de torta */}
        <div className="col-md-6 mb-4">
          <h5 className="text-center">Distribución de Usuarios</h5>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={usuariosData}
                dataKey="valor"
                nameKey="nombre"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label
              >
                {usuariosData.map((entry, index) => (
                  <Cell key={index} fill={colores[index % colores.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
          <p className="text-center mt-2">
            Total de usuarios: {resumen.totalUsuarios}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
