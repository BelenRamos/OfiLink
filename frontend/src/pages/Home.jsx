import React, { useEffect, useState } from 'react';
import { apiFetch } from '../utils/apiFetch';
import CardContratacion from '../components/CardContrataciones';
import { useAuth } from '../hooks/useAuth'; 

const Home = () => {
    const { usuario, tienePermiso, tieneRol } = useAuth(); //Se obtiene toda la info y las funciones del Contexto
    const [contrataciones, setContrataciones] = useState([]);
    const [mensaje, setMensaje] = useState(''); 

    // Función auxiliar para extraer el mensaje de error
    const extractErrorMessage = (error, defaultMessage) => {
        const errorBody = error.response || {};
        const errorMessage = errorBody.error || defaultMessage;
        return errorMessage + (errorBody.details ? ` (${errorBody.details})` : '');
    };

    const cargarContrataciones = async () => {
        if (!usuario) return; 
        setMensaje(''); 
        
        try {
            const data = await apiFetch('/api/contrataciones');
            setContrataciones(data);
            setMensaje(''); 
        } catch (error) {
            const fullMessage = extractErrorMessage(error, 'Error al cargar las contrataciones.');
            console.error('Error al cargar contrataciones:', error);
            setMensaje(fullMessage); 
        }
    };

    useEffect(() => {
        if (usuario) {
            cargarContrataciones();
        }
    }, [usuario]); 

    if (!tienePermiso("ver_home")) {
        // Si la PrivateRoute no maneja el rol/permiso específico, se muestra el error aquí.
        return <h2 className="mt-4">No tienes permiso para acceder al Home</h2>;
    }

    const permisosTarjeta = {
        aceptar: !!tienePermiso('contratacion_aceptar'),
        cancelar: !!tienePermiso('contratacion_cancelar'),
        resenar: !!tienePermiso('contratacion_resenar'),
        terminar: !!tienePermiso('contratacion_terminar'),
    };

    //Filtrado de Contrataciones: Usamos la función tieneRol del Contexto
    let contratacionesMostradas = contrataciones;
    if (tieneRol('cliente')) {
        contratacionesMostradas = contrataciones.filter(c => c.estado === 'En curso');
    }

    return (
        <div className="container mt-4">
            {/* Usamos directamente el objeto 'usuario' del contexto */}
            <h2>Bienvenido, {usuario.nombre}</h2>
            {mensaje && <div className="alert alert-info">{mensaje}</div>}

            {contratacionesMostradas.length === 0 && !mensaje && (
                 <p>¡No tienes contrataciones en curso!</p>
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