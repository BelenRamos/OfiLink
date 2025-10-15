import { useState, useEffect } from 'react';

// Componente Modal para Agregar/Editar Oficios
const OficioModal = ({ oficio, onClose, onSave }) => {
    // Inicializa el estado del formulario con los datos del oficio (si existe)
    // o como vacíos para un nuevo oficio.
    const [nombre, setNombre] = useState(oficio ? oficio.Nombre : '');
    const [descripcion, setDescripcion] = useState(oficio ? oficio.Descripcion : '');

    // Bandera para saber si estamos editando o creando
    const isEditMode = !!oficio;

    // Asegura que la descripción se cargue correctamente si el oficio cambia
    useEffect(() => {
        setNombre(oficio ? oficio.Nombre : '');
        setDescripcion(oficio ? oficio.Descripcion : '');
    }, [oficio]);

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!nombre.trim()) {
            alert("El nombre del oficio es obligatorio.");
            return;
        }

        // Llama a la función onSave con los datos limpios del formulario
        onSave({ nombre, descripcion: descripcion || null }); 
    };

    return (
        // El modal de Bootstrap
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">{isEditMode ? '✏️ Editar Oficio' : '➕ Agregar Nuevo Oficio'}</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="modal-body">
                            <div className="mb-3">
                                <label htmlFor="nombre" className="form-label">Nombre del Oficio (*)</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="nombre"
                                    value={nombre}
                                    onChange={(e) => setNombre(e.target.value)}
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