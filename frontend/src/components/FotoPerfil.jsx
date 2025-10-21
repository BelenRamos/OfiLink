import React, { useState } from 'react';

const BACKEND_BASE_URL = 'http://localhost:3000'; 

const FotoPerfil = ({ userId, currentFotoUrl, onFotoUpdate }) => {
    // Estado local para mostrar un mensaje de carga o error
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState(null);
    const [mostrarInput, setMostrarInput] = useState(false);
    const [version, setVersion] = useState(Date.now());

    
    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const MAX_SIZE = 2 * 1024 * 1024; // 2MB
        if (file.size > MAX_SIZE) {
            alert('El archivo es demasiado grande. Máximo permitido es 2MB.');
            e.target.value = null;
            return;
        }

        setCargando(true);
        setError(null);

        const formData = new FormData();
        formData.append('foto', file); 

        try {
            const res = await fetch(`/api/personas/${userId}/foto`, { 
                method: 'PUT',
                body: formData,
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.mensaje || 'Error al subir la foto');
            }

            const data = await res.json();
        
            onFotoUpdate(data.foto_url); 

            setVersion(Date.now()); 
            setMostrarInput(false);


            // Limpiar el input
            e.target.value = null; 

        } catch (err) {
            console.error('Error al subir la foto:', err);
            setError(err.message || 'Error desconocido al subir la foto.');
            alert(`Fallo la subida: ${err.message || 'Error desconocido'}`);
        } finally {
            setCargando(false);
        }
    };
    
    // 1. Calcular la URL base
    const fotoServidorUrl = BACKEND_BASE_URL + currentFotoUrl;

    // 2. Aplicar el cache buster si estamos usando la foto del servidor
    const finalSrc = currentFotoUrl && currentFotoUrl !== '/default-avatar.png'
        ? `${fotoServidorUrl}?v=${version}` // Añadimos ?v=TIMESTAMP
        : '/default-avatar.png';

    return (
        <div className="mb-4 p-3 border rounded">
            <div className="d-flex align-items-end mb-3">
                {/* 1. Visualización de la foto actual */}
                <img
                    src={finalSrc}
                    alt="Foto de perfil"
                    style={{ width: '150px', height: '150px', objectFit: 'cover', borderRadius: '8px' }}
                    className="me-3"
                />
                
                {/* 2. CONTROLES DE SUBIDA */}
                <div className="d-flex flex-column">
                    
                    {/*Muestra el input O es el input si no hay foto */}
                    {(!currentFotoUrl || currentFotoUrl === '/default-avatar.png' || mostrarInput) ? (
                        <div>
                            <input
                                type="file"
                                accept="image/*"
                                className="form-control form-control-sm"
                                onChange={handleFileChange}
                                disabled={cargando}
                            />
                            <small className="form-text text-muted">Máx. 2MB. Formatos: JPG, PNG.</small>
                            
                            {/*Botón para cancelar la subida */}
                            {mostrarInput && (
                                <button 
                                    className="btn btn-link btn-sm text-danger mt-1 p-0"
                                    onClick={() => setMostrarInput(false)}
                                >
                                    Cancelar
                                </button>
                            )}
                        </div>
                        
                    ) : (
                        
                        // Si SÍ hay foto y el input está oculto, se muestra el botón "Cambiar"
                        <button 
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => setMostrarInput(true)} // Al hacer clic, muestra el input
                        >
                            Cambiar Foto
                        </button>
                    )}
                </div>
            </div>

            {cargando && <div className="text-info">Subiendo foto...</div>}
            {error && <div className="text-danger">Error: {error}</div>}
        </div>
    );
};

export default FotoPerfil;