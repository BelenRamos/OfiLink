import React, { useState, useEffect } from 'react';
import { apiFetch } from '../utils/apiFetch';
import { useAuth } from '../hooks/useAuth'; 

const FormularioPermiso = ({ permiso, todosLosPermisos, fetchPermisos, setExito, setError, closeModal }) => {
    
    const { tienePermiso } = useAuth();
    const CAN_MANAGE = tienePermiso('gestionar_permisos'); // Permitir edición y creación

    const [nombre, setNombre] = useState(permiso ? permiso.Nombre : '');
    const [descripcion, setDescripcion] = useState(permiso ? permiso.Descripcion : '');
    const [padreId, setPadreId] = useState(permiso ? (permiso.PadreId || '') : '');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (permiso) {
            setNombre(permiso.Nombre || '');
            setDescripcion(permiso.Descripcion || '');
            setPadreId(permiso.PadreId || '');
        } else {
            setNombre('');
            setDescripcion('');
            setPadreId('');
        }
    }, [permiso]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!CAN_MANAGE) { 
             setError('Acceso denegado. No tienes permisos para realizar esta acción.');
             return;
        }
        
        setLoading(true);
        setError('');
        setExito('');
        
        if (permiso && permiso.Id === parseInt(padreId)) {
             setError('Un permiso no puede ser su propio padre.');
             setLoading(false);
             return;
        }

        const method = permiso ? 'PUT' : 'POST';
        const url = permiso ? `/api/permisos/${permiso.Id}` : '/api/permisos';
        const bodyData = { 
            nombre, 
            descripcion, 
            padreId: padreId === '' ? null : parseInt(padreId)
        };

        try {
            await apiFetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bodyData),
            });

        const successMsg = permiso ? `Permiso '${nombre}' actualizado con éxito.` : `Permiso '${nombre}' creado con éxito.`;
        setExito(successMsg); 
        closeModal(); 
        fetchPermisos();
        } catch (err) {
            setError(err.message || 'Error al guardar el permiso.'); 
        } finally {
            setLoading(false);
        }
    };

    const opcionesPadre = todosLosPermisos.filter(p => !permiso || p.Id !== permiso.Id);

    return (
        <form onSubmit={handleSubmit}>
            <div className="row g-3">
                <div className="col-md-4">
                    <label className="form-label">Nombre *</label>
                    <input
                        type="text"
                        className="form-control"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        required
                        disabled={loading || !CAN_MANAGE} //Deshabilitar --> Si no hay permiso
                    />
                </div>
                <div className="col-md-5">
                    <label className="form-label">Descripción</label>
                    <input
                        type="text"
                        className="form-control"
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
                        disabled={loading || !CAN_MANAGE} //Deshabilitar --> Si no hay permiso
                    />
                </div>
                <div className="col-md-3">
                    <label className="form-label">Permiso Padre</label>
                    <select
                        className="form-select"
                        value={padreId}
                        onChange={(e) => setPadreId(e.target.value)}
                        disabled={loading || !CAN_MANAGE} //Deshabilitar --> Si no hay permiso
                    >
                        <option value="">(Ninguno)</option>
                        {opcionesPadre.map(p => (
                            <option key={p.Id} value={p.Id}>{p.Nombre} ({p.Id})</option>
                        ))}
                    </select>
                </div>
            </div>
            
            <div className="mt-3">
                <button 
                    type="submit" 
                    className={`btn ${permiso ? 'btn-warning' : 'btn-primary'}`} 
                    disabled={loading || !nombre || !CAN_MANAGE} 
                >
                    {loading ? 'Guardando...' : permiso ? 'Guardar Cambios' : 'Crear Permiso'}
                </button>
                {!CAN_MANAGE && (
                    <small className="text-danger ms-3">No tienes permisos para editar.</small>
                )}
            </div>
        </form>
    );
};

export default FormularioPermiso;