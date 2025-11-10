import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth'; 
import useLogin from '../hooks/useLogin'; 
import LoginForm from '../components/LoginForm'; 

const Login = () => {
    const { usuario, loginUser } = useAuth();
    const navigate = useNavigate();

    const { 
        credenciales, 
        errorMensaje, 
        loading,
        handleChange, 
        handleLogin 
    } = useLogin(loginUser); 

    // Efecto de Redirección 
    useEffect(() => {
        if (usuario && usuario.ruta_inicio) { //Dependecia de usuario
            navigate(usuario.ruta_inicio, { replace: true }); //Dependecia del navigate
        }
    }, [usuario, navigate]); 

    // Lógica de Renderizado
    if (usuario) {
        return <p className="container mt-4">Iniciando sesión...</p>;
    }
    
    return (
        <LoginForm 
            credenciales={credenciales}
            errorMensaje={errorMensaje}
            loading={loading}
            handleChange={handleChange}
            handleLogin={handleLogin}
            navigate={navigate} // Pasamos navigate para los enlaces de registro/cambio de contraseña
        />
    );
};

export default Login;