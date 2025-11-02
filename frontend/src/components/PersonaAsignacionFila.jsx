import React from 'react';
import { FaSave } from 'react-icons/fa';

const PersonaAsignacionFila = ({
    persona,
    grupos,
    cambiosPendientes,
    isSaving,
    handleGrupoChange,
    handleGuardarAsignacion
}) => {
    
    const pendiente = cambiosPendientes[persona.Id] !== undefined;
    
    // Obtener el valor actual del selector (puede ser el pendiente o el original)
    const selectValue = pendiente 
        ? (cambiosPendientes[persona.Id] === null ? '' : cambiosPendientes[persona.Id])
        : (persona.GrupoId || '');

    return (
        <tr key={persona.Id} className={pendiente ? 'table-warning' : ''}>
            <td>{persona.Id}</td>
            <td>
                <strong>{persona.PersonaNombre}</strong>
                <small className="d-block text-muted">{persona.Mail}</small>
            </td>
            <td>
                <select
                    className="form-select"
                    value={selectValue}
                    onChange={(e) => handleGrupoChange(persona.Id, e.target.value)}
                    disabled={isSaving} 
                >
                    <option value="">(Sin Grupo)</option>
                    {grupos.map(grupo => (
                        <option key={grupo.Id} value={grupo.Id}>
                            {grupo.Nombre}
                        </option>
                    ))}
                </select>
            </td>
            <td>
                <button
                    className="btn btn-success btn-sm"
                    onClick={() => handleGuardarAsignacion(persona.Id)}
                    disabled={!pendiente || isSaving} 
                    title="Guardar asignación"
                >
                    <FaSave /> Guardar
                </button>
            </td>
        </tr>
    );
};

export default PersonaAsignacionFila;