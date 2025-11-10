import { useState, useCallback } from 'react';

/**
 * Hook personalizado para gestionar la lógica de inicio de sesión:
 * estados de credenciales y mensaje de error, y la función de login.
 * @param {function} loginUser Función del contexto de autenticación para establecer el usuario logueado.
 * @returns {object} Estado y handlers necesarios para el componente Login.
 */
const useLogin = (loginUser) => {
    // --- 1. Estados de Formulario y Error ---
    const [credenciales, setCredenciales] = useState({ usuario: '', password: '' });
    const [errorMensaje, setErrorMensaje] = useState('');
    const [loading, setLoading] = useState(false); 

    // --- 2. Handler para cambios en los inputs ---
    const handleChange = useCallback((e) => {
        setCredenciales(prevCredenciales => ({
            ...prevCredenciales,
            [e.target.name]: e.target.value
        }));
        // Limpiar el mensaje de error al cambiar cualquier input
        setErrorMensaje('');
    }, []);

    // --- 3. Handler para el envío del formulario (Login) ---
    const handleLogin = useCallback(async (e) => {
        e.preventDefault();
        setErrorMensaje('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credenciales),
            });

            // Manejo de error 403 (Prohibido/Permisos)
            if (res.status === 403) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Acceso denegado. Verifica tus permisos.');
            }

            // Manejo de otros errores HTTP 
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error || 'Credenciales incorrectas o error de conexión.');
            }

            const { usuario, token } = await res.json();

            // Normalización del objeto usuario 
            const usuarioNormalizado = {
                id: usuario.id,
                nombre: usuario.nombre,
                mail: usuario.mail,
                grupo: usuario.grupo,
                roles: usuario.roles || [],
                roles_keys: usuario.roles_keys || [],
                ruta_inicio: usuario.ruta_inicio,
                token
            };

            loginUser(usuarioNormalizado);
            // El componente Login.jsx se encargará de la redirección mediante useEffect
        } catch (err) {
            setErrorMensaje(err.message);
        } finally {
            setLoading(false);
        }
    }, [credenciales, loginUser]);

    return {
        credenciales,
        errorMensaje,
        loading,
        handleChange,
        handleLogin,
    };
};

export default useLogin;