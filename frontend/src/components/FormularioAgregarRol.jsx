import React, { useState } from 'react';
import axios from 'axios';

const FormularioAgregarRol = ({ fetchRoles, setError, setExito }) => {
    const [nuevoRol, setNuevoRol] = useState('');

    const handleAgregarRol = async (e) => {
        e.preventDefault();
        setError('');
        setExito('');

        if (!nuevoRol.trim()) {
            setError('El nombre del rol es obligatorio');
            return;
        }

        try {
            await axios.post('/api/roles', { nombre: nuevoRol });
            setExito('Rol creado con éxito');
            setNuevoRol('');
            fetchRoles(); // Refrescar la lista de roles en el componente padre
        } catch (err) {
            setError(err.response?.data?.error || 'Error al crear el rol');
        }
    };

    return (
        <form className="mb-4" onSubmit={handleAgregarRol}>
            <div className="input-group">
                <input
                    type="text"
                    className="form-control"
                    placeholder="Nuevo rol..."
                    value={nuevoRol}
                    onChange={(e) => setNuevoRol(e.target.value)}
                />
                <button type="submit" className="btn btn-primary">Agregar Rol</button>
            </div>
        </form>
    );
};

export default FormularioAgregarRol;