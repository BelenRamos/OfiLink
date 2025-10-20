import { useState, useEffect } from 'react';

const OficioModal = ({ oficio, onClose, onSave }) => {
    const [nombre, setNombre] = useState(oficio ? oficio.Nombre : '');
    const [descripcion, setDescripcion] = useState(oficio ? oficio.Descripcion : '');
    const [errorValidacion, setErrorValidacion] = useState(''); 

    const isEditMode = !!oficio;

    useEffect(() => {
        setNombre(oficio ? oficio.Nombre : '');
        setDescripcion(oficio ? oficio.Descripcion : '');
        setErrorValidacion('');
    }, [oficio]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setErrorValidacion(''); 

        if (!nombre.trim()) {
            setErrorValidacion("El nombre del oficio es obligatorio.");
            return;
        }

        onSave({ nombre, descripcion: descripcion || null }); 

    };
    
    const handleNombreChange = (e) => {
        setNombre(e.target.value);
        if (errorValidacion) {
            setErrorValidacion('');
        }
    };

    return (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">{isEditMode ? '✏️ Editar Oficio' : '➕ Agregar Nuevo Oficio'}</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    
                    {errorValidacion && (
                        <div className="alert alert-danger mx-3 mt-3 mb-0" role="alert">
                            {errorValidacion}
                        </div>
                    )}
                    
                    <form onSubmit={handleSubmit}>
                        <div className="modal-body">
                            <div className="mb-3">
                                <label htmlFor="nombre" className="form-label">Nombre del Oficio (*)</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="nombre"
                                    value={nombre}
                                    onChange={handleNombreChange}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="descripcion" className="form-label">Descripción</label>
                                <textarea
                                    className="form-control"
                                    id="descripcion"
                                    rows="3"
                                    value={descripcion || ''}
                                    onChange={(e) => setDescripcion(e.target.value)}
                                ></textarea>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                            <button type="submit" className="btn btn-primary">
                                {isEditMode ? '💾 Guardar Cambios' : '✅ Crear Oficio'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default OficioModal;