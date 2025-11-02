import React, { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../../../utils/apiFetch';
import { useAuth } from '../../../hooks/useAuth';
import { FaSync } from 'react-icons/fa';
import PersonaAsignacionFila from '../../../components/PersonaAsignacionFila'; 

const Asignaciones = () => { 
    const { isLoading: authLoading } = useAuth();
    
    const [error, setError] = useState('');
    const [exito, setExito] = useState('');
    const [personas, setPersonas] = useState([]);
    const [grupos, setGrupos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [cambiosPendientes, setCambiosPendientes] = useState({});

    const displaySuccess = useCallback((message) => {
        setExito(message);
        setError('');
        setTimeout(() => setExito(''), 5000);
    }, []);

    const displayError = useCallback((message) => {
        setError(message);
        setExito('');
        setTimeout(() => setError(''), 8000);
    }, []);

    const fetchAllData = useCallback(async () => {
        setLoading(true);
        try {
            const personasData = await apiFetch('/api/asignaciones/personas');
            setPersonas(personasData);
            const gruposData = await apiFetch('/api/asignaciones/grupos');
            setGrupos(gruposData);
            setCambiosPendientes({}); 
            displaySuccess('Datos de personas y grupos cargados correctamente.');
        } catch (err) {
            displayError(err.message || 'Error al cargar datos necesarios.');
        } finally {
            setLoading(false);
        }
    }, [displaySuccess, displayError]);

    useEffect(() => {
        if (!authLoading) {
            fetchAllData();
        }
    }, [authLoading, fetchAllData]);

    const handleGrupoChange = (personaId, newGrupoId) => {
        setCambiosPendientes(prev => ({
            ...prev,
            [personaId]: newGrupoId === '' ? null : parseInt(newGrupoId)
        }));
    };

    const handleGuardarAsignacion = async (personaId) => {
        const nuevoGrupoId = cambiosPendientes[personaId];
        if (nuevoGrupoId === undefined) return;

        setIsSaving(true);
        try {
            await apiFetch('/api/asignaciones/asignar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ personaId, grupoId: nuevoGrupoId })
            });
            
            displaySuccess(`Asignación guardada para la persona ID ${personaId}.`);
            
            setPersonas(prevPersonas => prevPersonas.map(p => 
                p.Id === personaId 
                    ? { 
                        ...p, 
                        GrupoId: nuevoGrupoId,
                        GrupoNombre: grupos.find(g => g.Id === nuevoGrupoId)?.Nombre || null
                      } 
                    : p
            ));

            setCambiosPendientes(prev => {
                const newState = { ...prev };
                delete newState[personaId];
                return newState;
            });
            
        } catch (err) {
            displayError(err.message || `Error al guardar la asignación para ID ${personaId}.`);
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return <div className="container mt-4"><p>Cargando datos de personas y grupos...</p></div>;
    }

    return (
        <div className="container mt-4">
            <h3>👥 Asignación de Grupos a Personas</h3>
            {error && <div className="alert alert-danger">{error}</div>}
            {exito && <div className="alert alert-success">{exito}</div>}

            <button className="btn btn-secondary mb-3" onClick={fetchAllData} disabled={loading || isSaving}>
                <FaSync /> Recargar Datos
            </button>

            <table className="table table-bordered table-striped">
                <thead className='table-dark'>
                    <tr>
                        <th style={{ width: '50px' }}>ID</th>
                        <th>Nombre de Persona / Correo</th>
                        <th style={{ width: '30%' }}>Grupo Actual</th>
                        <th style={{ width: '150px' }}>Acción</th>
                    </tr>
                </thead>
                <tbody>
                    {personas.map(persona => (
                        <PersonaAsignacionFila
                            key={persona.Id}
                            persona={persona}
                            grupos={grupos}
                            cambiosPendientes={cambiosPendientes}
                            isSaving={isSaving}
                            handleGrupoChange={handleGrupoChange}
                            handleGuardarAsignacion={handleGuardarAsignacion}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Asignaciones;