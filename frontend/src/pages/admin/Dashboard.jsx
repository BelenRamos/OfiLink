import { useEffect, useState } from "react";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const Dashboard = () => {
  const [usuariosData, setUsuariosData] = useState([]);
  const [actividadData, setActividadData] = useState([]);

  useEffect(() => {
    // Cargar resumen de usuarios
    axios
      .get("/api/personas/resumen")
      .then((res) => {
        const resumen = res.data;
        const datos = [
          { tipo: "Trabajadores", cantidad: resumen.totalTrabajadores },
          { tipo: "Clientes", cantidad: resumen.totalClientes },
        ];
        setUsuariosData(datos);
      })
      .catch((err) => console.error("Error al obtener resumen de usuarios:", err));

    // Cargar resumen de solicitudes y contrataciones
    axios
      .get("/api/estadisticas/solicitudes-contrataciones")
      .then((res) => {
        const resumen = res.data;
        const datos = [
          { tipo: "Solicitudes", cantidad: resumen.totalSolicitudes },
          { tipo: "Contrataciones", cantidad: resumen.totalContrataciones },
        ];
        setActividadData(datos);
      })
      .catch((err) =>
        console.error("Error al obtener resumen de actividad:", err)
      );
  }, []);

  const COLORS = ["#CD94C1", "#D4E271"];

  return (
    <div className="p-6 flex flex-col items-center gap-10">

      {/*GRÁFICO 1: Distribución de Usuarios */}
      <div className="shadow-lg rounded-2xl p-4 bg-white w-full md:w-2/3">
        <h2 className="text-center text-xl font-semibold mb-4 text-gray-700">
          Distribución de Usuarios
        </h2>
        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie
              data={usuariosData}
              dataKey="cantidad"
              nameKey="tipo"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {usuariosData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/*GRÁFICO 2: Solicitudes vs Contrataciones*/}
      <div className="shadow-lg rounded-2xl p-4 bg-white w-full md:w-2/3">
        <h2 className="text-center text-xl font-semibold mb-4 text-gray-700">
          Solicitudes vs Contrataciones
        </h2>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart
            data={actividadData}
            margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="tipo" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey="cantidad" fill="#CD94C1" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Dashboard;
