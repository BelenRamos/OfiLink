const LoginForm = ({ credenciales, errorMensaje, loading, handleChange, handleLogin, navigate }) => {
    return (
        <div className="container mt-4" style={{ maxWidth: '400px' }}>
            <h2 className="mb-4">Ingresar</h2>
            
            {/* Mensaje de error */}
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
                <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                    {loading ? 'Cargando...' : 'Ingresar'}
                </button>
            </form>
            <div className="mt-3 text-center">
                <p 
                    className="text-primary" 
                    style={{ cursor: 'pointer', textDecoration: 'underline' }} 
                    onClick={() => navigate('/formularioRegistro')}
                >
                    ¿No tienes una cuenta? Regístrate
                </p>
                <p 
                    className="text-primary mt-2" 
                    style={{ cursor: 'pointer', textDecoration: 'underline' }} 
                    onClick={() => navigate('/cambiarPassword')}
                >
                    ¿Quieres cambiar tu contraseña? Has click aquí
                </p>
            </div>
        </div>
    );
};

export default LoginForm;