import React from "react";
import { useAuth } from "../../hooks/useAuth";
import useDashboard from "../../hooks/seguridad/useDashboard";
import {
    PieChart, Pie, Cell, Tooltip, Legend,
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    ResponsiveContainer,
} from "recharts";

const Dashboard = () => {
    const authContext = useAuth();
    
    // Usar el hook para obtener datos y estados
    const {
        usuariosData,
        actividadData,
        error,
        puedeVer,
        isLoadingAuth,
        COLORS,
    } = useDashboard(authContext);

    if (isLoadingAuth) return <p className="mt-4">Cargando permisos...</p>;

    if (!puedeVer) {
        return <h2 className="mt-4 text-danger">No tienes permiso para ver el Dashboard.</h2>;
    }

    return (
        <div className="p-6 flex flex-col items-center gap-10">
            <h1 className="text-3xl font-bold text-gray-800">Panel Administrativo</h1>
            {error && <div className="alert alert-danger w-full md:w-2/3 text-center">{error}</div>}

            {/* GRÁFICO 1: Distribución de Usuarios */}
            <div className="shadow-lg rounded-2xl p-4 bg-white w-full md:w-2/3">
                <h2 className="text-center text-xl font-semibold mb-4 text-gray-700">
                    Distribución de Usuarios
                </h2>
                {usuariosData.length > 0 ? (
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
                ) : (
                    <p className="text-center text-gray-500">No hay datos de usuarios para mostrar.</p>
                )}
            </div>

            {/* GRÁFICO 2: Solicitudes vs Contrataciones */}
            <div className="shadow-lg rounded-2xl p-4 bg-white w-full md:w-2/3">
                <h2 className="text-center text-xl font-semibold mb-4 text-gray-700">
                    Solicitudes vs Contrataciones
                </h2>
                {actividadData.length > 0 && actividadData.some(d => d.cantidad > 0) ? (
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
                            <Bar dataKey="cantidad" fill={COLORS[0]} radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <p className="text-center text-gray-500">No hay datos de actividad para mostrar.</p>
                )}
            </div>
        </div>
    );
};

export default Dashboard;