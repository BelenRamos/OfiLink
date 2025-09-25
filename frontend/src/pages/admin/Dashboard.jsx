import { useEffect, useState } from "react";
import axios from "axios";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

const Dashboard = () => {
  const [usuariosData, setUsuariosData] = useState([]);

  useEffect(() => {
    axios.get("/api/personas/resumen")
      .then(res => {
        const resumen = res.data;

        // Convertimos el objeto en un array para Recharts
        const datos = [
          { tipo: "Trabajadores", cantidad: resumen.totalTrabajadores },
          { tipo: "Clientes", cantidad: resumen.totalClientes }
        ];

        setUsuariosData(datos);
      })
      .catch(err => console.error(err));
  }, []);

  const COLORS = ["#CD94C1", "#D4E271"]; 

  return (
    <div>
      <h2>Distribución de Usuarios</h2>
      <PieChart width={400} height={400}>
        <Pie
          data={usuariosData}
          dataKey="cantidad"
          nameKey="tipo"
          cx="50%"
          cy="50%"
          outerRadius={120}
          label
        >
          {usuariosData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </div>
  );
};

export default Dashboard;
