import useCambiarPassword from '../hooks/useCambiarPassword'; 

const CambiarPassword = () => {
    const { 
        credenciales, 
        mensaje, 
        loading, 
        handleChange, 
        handleSubmit 
    } = useCambiarPassword();

    const getAlertClass = (msg) => {
        if (!msg) return 'd-none';
        return msg.startsWith('Error') ? 'alert-danger' : 'alert-info';
    };

    return (
        <div className="container mt-4" style={{ maxWidth: '400px' }}>
            <h2 className="mb-4">Cambiar Contraseña</h2>
            <form onSubmit={handleSubmit}>
                {/* Email */}
                <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                        name="email"
                        value={credenciales.email}
                        onChange={handleChange}
                        type="email"
                        className="form-control"
                        required
                    />
                </div>
                
                {/* Contraseña Actual */}
                <div className="mb-3">
                    <label className="form-label">Contraseña Actual</label>
                    <input
                        name="oldPassword"
                        value={credenciales.oldPassword}
                        onChange={handleChange}
                        type="password"
                        className="form-control"
                        required
                    />
                </div>
                
                {/* Contraseña nueva*/}
                <div className="mb-3">
                    <label className="form-label">Nueva Contraseña</label>
                    <input
                        name="newPassword"
                        value={credenciales.newPassword}
                        onChange={handleChange}
                        type="password"
                        className="form-control"
                        required
                    />
                </div>
                
                <button 
                    type="submit" 
                    className="btn btn-primary w-100" 
                    disabled={loading} 
                >
                    {loading ? 'Cambiando...' : 'Cambiar Contraseña'}
                </button>
            </form>
        
            {mensaje && (
                <div className={`alert ${getAlertClass(mensaje)} mt-3`}>
                    {mensaje}
                </div>
            )}
        </div>
    );
};

export default CambiarPassword;