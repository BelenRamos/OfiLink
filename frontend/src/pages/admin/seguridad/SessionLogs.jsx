import React from "react";
import { useAuth } from "../../../hooks/useAuth";
import useSessionLogs from "../../../hooks/seguridad/useSessionLogs";
import SessionLogFilters from "../../../components/FiltrosSessionLog";
import SessionLogTable from "../../../components/TablaSessionLog";

const SessionLogs = () => {
    const authContext = useAuth();
    
    // Consumimos el hook, pasando el contexto de autenticación
    const {
        isLoadingAuth,
        puedeVerLogs,
        logs,
        loadingData,
        error,
        fechaInicio,
        setFechaInicio,
        fechaFin,
        setFechaFin,
        cargarLogs,
        formatearFecha,
    } = useSessionLogs(authContext);

    // --- Renderizado de Estado de Autenticación y Permisos ---

    if (isLoadingAuth) {
        return <div className="container mt-4"><p className="text-info">Cargando permisos...</p></div>;
    }

    if (!puedeVerLogs) {
        return (
            <div className="container mt-4">
                <div className="alert alert-danger" role="alert">
                    🚫 Acceso denegado. No tienes el permiso requerido para ver el historial de sesiones.
                </div>
            </div>
        );
    }

    // --- Renderizado de la Vista Principal ---

    return (
        <div className="container mt-4">
            <h2>Logs de Sesión del Sistema</h2>
            
            {/* Mostrar mensajes de error */}
            {error && <div className="alert alert-danger shadow-sm">{error}</div>}

            {/* Componente de Filtros */}
            <SessionLogFilters
                fechaInicio={fechaInicio}
                setFechaInicio={setFechaInicio}
                fechaFin={fechaFin}
                setFechaFin={setFechaFin}
                cargarLogs={cargarLogs}
                loadingData={loadingData}
            />
            
            {/* Componente de Tabla */}
            <SessionLogTable
                logs={logs}
                formatearFecha={formatearFecha}
                loadingData={loadingData}
                error={error}
            />
        </div>
    );
};

export default SessionLogs;