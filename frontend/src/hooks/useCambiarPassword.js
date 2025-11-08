import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Hook personalizado para manejar la lógica de cambio de contraseña.
 * Gestiona el estado del formulario, la comunicación con la API,
 * los mensajes de estado y la navegación.
 */
const useCambiarPassword = () => {
    const navigate = useNavigate();

    // 1. Estados
    const [credenciales, setCredenciales] = useState({ 
        email: '', 
        oldPassword: '', 
        newPassword: '' 
    });
    const [mensaje, setMensaje] = useState('');
    const [loading, setLoading] = useState(false);
    
    // 2. Handler para actualizar el estado de las credenciales
    const handleChange = useCallback((e) => {
        setCredenciales(prevCredenciales => ({ 
            ...prevCredenciales, 
            [e.target.name]: e.target.value 
        }));
    }, []);

    // 3. Handler para enviar el formulario y manejar la lógica de la API
    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        setLoading(true);
        setMensaje('Cambiando contraseña...');
        
        try {
            const res = await fetch('/api/auth/cambiarPassword', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credenciales),
            });

            const data = await res.json();
            
            if (res.ok) {
                setMensaje(data.mensaje);
                setTimeout(() => {
                    navigate('/login');
                }, 1000); 
                
            } else {
                setMensaje(`Error: ${data.mensaje || 'Fallo al cambiar la contraseña. Inténtalo de nuevo.'}`);
            }

        } catch (error) {
            console.error('Error de red al cambiar contraseña:', error);
            setMensaje('Error de conexión. Inténtalo de nuevo más tarde.');
        } finally {
            setLoading(false);
        }
    }, [credenciales, navigate]);

    // 4. Retorno del Hook
    return {
        credenciales,
        mensaje,
        loading,
        handleChange,
        handleSubmit
    };
};

export default useCambiarPassword;