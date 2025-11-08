import React, { useState } from 'react';
import { apiFetch } from '../utils/apiFetch';

const FormularioContratacion = ({ idTrabajador, onCancel, onSuccess }) => {
    const [descripcion, setDescripcion] = useState('');
    const [fecha, setFecha] = useState('');
    const [errorApi, setErrorApi] = useState(null); 

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorApi(null);

        console.log('Datos a enviar:', {
            trabajador_id: idTrabajador,
            descripcion_trabajo: descripcion,
            fecha_inicio: fecha
        });
        
        try {
            await apiFetch('/api/contrataciones', {
                method: 'POST',
                // Asegúrate de que el body se envía correctamente, a menudo requiere JSON.stringify si apiFetch no lo hace
                body: JSON.stringify({
                    trabajador_id: idTrabajador,
                    descripcion_trabajo: descripcion,
                    fecha_inicio: fecha
                })
            });

            setDescripcion('');
            setFecha('');
            onSuccess && onSuccess('success', 'Solicitud de contratación enviada con éxito.');

        } catch (error) {
            console.error("Error al crear la contratación:", error);
            const defaultMessage = "Ocurrió un error al enviar la solicitud de contratación.";
            const errorMessage = error.response?.error || error.message || defaultMessage;
            setErrorApi(errorMessage);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="border p-3 mb-3">
            {errorApi && (
                <div className="alert alert-danger" role="alert">
                    {errorApi}
                </div>
            )}
            
            <div className="mb-3">
                <label>Descripción del trabajo</label>
                <textarea
                    className="form-control"
                    value={descripcion}
                    onChange={e => {
                        setDescripcion(e.target.value);
                        if (errorApi) setErrorApi(null);
                    }}
                    required
                />
            </div>

            <div className="mb-3">
                <label>Fecha deseada</label>
                <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    className="form-control"
                    value={fecha}
                    onChange={e => {
                        setFecha(e.target.value);
                        if (errorApi) setErrorApi(null);
                    }}
                    required
                />
            </div>

            <button type="submit" className="btn btn-primary me-2">Enviar solicitud</button>
            <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancelar</button>
        </form>
    );
};

export default FormularioContratacion;