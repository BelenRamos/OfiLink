import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';

// Constantes globales
const BACKEND_BASE_URL = 'http://localhost:3000'; 
const DEFAULT_AVATAR = '/default-avatar.png';

/**
 * Hook personalizado para la gestión de la lógica y datos del perfil del trabajador.
 */
const usePerfilTrabajador = (usuarioContext) => {
    const { id } = useParams();

    // 1. Declaración de Estados
    const [usuario, setUsuario] = useState(null); // Estado para el usuario actual 
    const [trabajador, setTrabajador] = useState(null);
    const [reseñas, setReseñas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mostrarDenuncia, setMostrarDenuncia] = useState(false);
    const [mostrandoFormulario, setMostrandoFormulario] = useState(false);
    const [mensajeFeedback, setMensajeFeedback] = useState({ tipo: '', mensaje: '' }); 

    // 2. Lógica de Feedback (Timer)
    useEffect(() => {
        if (mensajeFeedback.mensaje) {
            const timer = setTimeout(() => {
                setMensajeFeedback({ tipo: '', mensaje: '' });
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [mensajeFeedback]);

    // 3. Funciones de Fetching 
    const fetchTrabajador = useCallback(async () => {
        try {
            const res = await fetch(`/api/trabajadores/${id}`);
            if (!res.ok) throw new Error('Trabajador no encontrado');
            const data = await res.json();
            setTrabajador(data);
        } catch (error) {
            console.error('Error al obtener el trabajador:', error);
            setTrabajador(null); // Asegurar que sea null si hay un error 404
        }
    }, [id]);

    const fetchReseñas = useCallback(async () => {
        try {
            const res = await fetch(`/api/resenas/trabajador/${id}`);
            const data = await res.json();
            setReseñas(data);
        } catch (error) {
            console.error('Error al obtener reseñas:', error);
        }
    }, [id]);

    // 4. useEffect Principal para Carga de Datos y Usuario
    useEffect(() => {
        // Lógica de usuario
        if (usuarioContext) {
            setUsuario(usuarioContext);
        } else {
            const usuarioGuardado = localStorage.getItem('usuarioActual');
            if (usuarioGuardado) setUsuario(JSON.parse(usuarioGuardado));
        }

        setMensajeFeedback({ tipo: '', mensaje: '' });
        setLoading(true);

        Promise.all([fetchTrabajador(), fetchReseñas()]).finally(() => setLoading(false));
    }, [id, usuarioContext, fetchTrabajador, fetchReseñas]);


    // 5. Handlers de Operación 
    const handleContratacionExitosa = () => {
        setMostrandoFormulario(false);
        setMensajeFeedback({ tipo: 'success', mensaje: '✅ Contratación creada con éxito.' });
    };

    const handleDenunciaExitosa = () => {
        setMostrarDenuncia(false);
        setMensajeFeedback({ tipo: 'success', mensaje: '📩 Denuncia enviada con éxito.' });
    };

    // 6. Handlers de Interfaz (Ocultar/Mostrar)
    const toggleFormulario = (mostrar = true) => setMostrandoFormulario(mostrar);
    const toggleDenuncia = (mostrar = true) => setMostrarDenuncia(mostrar);
    const handleAbrirFormulario = () => setMostrandoFormulario(true);
    const handleCerrarFormulario = () => setMostrandoFormulario(false);
    const handleAbrirDenuncia = () => setMostrarDenuncia(true);
    const handleCerrarDenuncia = () => setMostrarDenuncia(false);


    // Devolver los estados y handlers que el componente necesita
    return {
        trabajador,
        reseñas,
        loading,
        mensajeFeedback,
        mostrarDenuncia,
        mostrandoFormulario,
        usuario, // El usuario local o del contexto
        handleContratacionExitosa,
        handleDenunciaExitosa,
        handleAbrirFormulario,
        handleCerrarFormulario,
        handleAbrirDenuncia,
        handleCerrarDenuncia,
        fotoUrl: trabajador?.foto_url ? BACKEND_BASE_URL + trabajador.foto_url : DEFAULT_AVATAR,
        calificacion_promedio: trabajador?.calificacion_promedio
    };
};

export default usePerfilTrabajador;