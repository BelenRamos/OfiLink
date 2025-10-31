import React, { useState } from 'react';
import { apiFetch } from '../utils/apiFetch';

const FormularioGrupo = ({ grupo, fetchGrupos, setExito, setError, closeModal }) => {
    const [nombre, setNombre] = useState(grupo ? grupo.Nombre : '');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setExito('');
        const method = grupo ? 'PUT' : 'POST';
        const url = grupo ? `/api/grupos/${grupo.Id}` : '/api/grupos';

        try {
            await apiFetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre }),
            });

            const successMsg = grupo ? `Grupo '${nombre}' actualizado con éxito.` : `Grupo '${nombre}' creado con éxito.`;
            setExito(successMsg);
            setNombre(''); // Limpiar si es creación
            closeModal && closeModal(); // Cerrar si es modal de edición
            fetchGrupos();
        } catch (err) {
            setError(err.message || 'Error al guardar el grupo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mb-4 p-3 border rounded bg-light">
            <h5 className="mb-3">{grupo ? `Editar Grupo: ${grupo.Nombre}` : 'Crear Nuevo Grupo'}</h5>
            <div className="input-group">
                <input
                    type="text"
                    className="form-control"
                    placeholder="Nombre del Grupo"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                    disabled={loading}
                />
                <button type="submit" className={`btn ${grupo ? 'btn-warning' : 'btn-primary'}`} disabled={loading || !nombre}>
                    {loading ? 'Guardando...' : grupo ? 'Guardar Cambios' : 'Crear Grupo'}
                </button>
            </div>
        </form>
    );
};

export default FormularioGrupo;