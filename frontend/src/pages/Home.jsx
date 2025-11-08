import React from 'react';
import CardContratacion from '../components/CardContrataciones';
import { useAuth } from '../hooks/useAuth'; 
import useHome from '../hooks/useHome';

const extractErrorMessage = (error, defaultMessage) => {
    const errorBody = error.response || {};
    const errorMessage = errorBody.error || defaultMessage;
    return errorMessage + (errorBody.details ? ` (${errorBody.details})` : '');
};

const Home = () => {
    const { usuario, tienePermiso, tieneRol } = useAuth(); // Obtenemos el contexto de auth

    const {
        contratacionesMostradas,
        mensaje,
        filtroEstado,
        setFiltroEstado,
        cargarContrataciones,
        permisosTarjeta,
        estadosContratacion,
    } = useHome({ usuario, tienePermiso, tieneRol }, extractErrorMessage);


    if (!tienePermiso("ver_home")) {
        return <h2 className="mt-4">No tienes permiso para acceder al Home</h2>;
    }

    return (
        <div className="container mt-4">
            <h2>¡Hola {usuario.nombre}!</h2>
            {mensaje && <div className="alert alert-info">{mensaje}</div>}

            {/*Selector de filtro para trabajadores */}
            {tieneRol('trabajador') && (
                <div className="mb-3 d-flex align-items-center">
                    <label htmlFor="filtroEstado" className="form-label me-2 mb-0">
                        Filtrar por estado:
                    </label>
                    <select
                        id="filtroEstado"
                        className="form-select w-auto" 
                        value={filtroEstado}
                        onChange={(e) => setFiltroEstado(e.target.value)}
                    >
                        {estadosContratacion.map(estado => (
                            <option key={estado} value={estado}>
                                {estado}
                            </option>
                        ))}
                    </select>
                </div>
            )}
            
            {/* Mensaje cuando no hay contrataciones para mostrar según el filtro/rol */}
            {contratacionesMostradas.length === 0 && !mensaje && (
                <p>¡No tienes contrataciones {tieneRol('cliente') ? 'en curso' : `en estado: ${filtroEstado}`}!</p>
            )}

            {contratacionesMostradas.map(c => (
                <CardContratacion
                    key={c.id}
                    contratacion={c}
                    usuario={usuario}
                    onActualizar={cargarContrataciones} 
                    permisos={permisosTarjeta} 
                />
            ))}
        </div>
    );
};

export default Home;