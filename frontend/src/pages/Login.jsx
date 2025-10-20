import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth'; 

const Login = () => {
    // Obtenemos el estado y la función setUsuario del contexto
    const { usuario, loginUser } = useAuth();
    
    const [credenciales, setCredenciales] = useState({ usuario: '', password: '' });
    const [errorMensaje, setErrorMensaje] = useState(''); 
    const navigate = useNavigate();

    useEffect(() => {
        // Chequeamos si el contexto ya tiene un usuario cargado
        if (usuario) {
            // El usuario ya está logueado, lo redirigimos a donde debería ir
            if (usuario.roles_keys.includes('administrador') || usuario.roles_keys.includes('supervisor')) {
                navigate('/admin', { replace: true });
            } else {
                navigate('/home', { replace: true });
            }
        }
    }, [usuario, navigate]); 

    const handleChange = (e) => {
        setCredenciales({ ...credenciales, [e.target.name]: e.target.value });
        setErrorMensaje('');
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setErrorMensaje(''); 

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credenciales),
            });

            // Manejo de error 403 (Prohibido/Permisos)
            if (res.status === 403) {
                const errorData = await res.json();
                // Lanzamos un error con el mensaje detallado del backend
                throw new Error(errorData.error || 'Acceso denegado. Verifica tus permisos.'); 
            }

            // Manejo de otros errores HTTP 
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({})); 
                throw new Error(errorData.error || 'Credenciales incorrectas o error de conexión.'); 
            }

            const { usuario, token } = await res.json();

            const usuarioNormalizado = {
                id: usuario.id,
                nombre: usuario.nombre,
                mail: usuario.mail,
                grupo: usuario.grupo,
                roles: usuario.roles || [],
                roles_keys: usuario.roles_keys || [], 
                token
            };
            
            loginUser(usuarioNormalizado); // Usamos loginUser para guardar en localStorage y decodificar el token

        } catch (err) {

            setErrorMensaje(err.message);
        }
    };

    if (usuario) {
        return <p className="container mt-4">Iniciando sesión...</p>;
    }
    
    return (
        <div className="container mt-4" style={{ maxWidth: '400px' }}>
            <h2 className="mb-4">Ingresar</h2>
            
            {errorMensaje && <div className="alert alert-danger">{errorMensaje}</div>} 

            <form onSubmit={handleLogin}>
                <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                        name="usuario"
                        value={credenciales.usuario}
                        onChange={handleChange}
                        type="text"
                        className="form-control"
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Contraseña</label>
                    <input
                        name="password"
                        value={credenciales.password}
                        onChange={handleChange}
                        type="password"
                        className="form-control"
                    />
                </div>
                <button type="submit" className="btn btn-primary w-100">Ingresar</button>
            </form>
            <div className="mt-3 text-center">
                <p className="text-primary" style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => navigate('/formularioRegistro')}>
                    ¿No tienes una cuenta? Regístrate
                </p>
                <p className="text-primary mt-2" style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => navigate('/cambiarPassword')}>
                    ¿Quieres cambiar tu contraseña? Has click aquí
                </p>
            </div>
        </div>
    );
};

export default Login;