import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../../utils/apiFetch';

/**
 * Hook personalizado para manejar la lógica de la pantalla de Asignación de Grupos a Personas.
 * Gestiona la carga de datos (personas y grupos), el estado de carga/guardado,
 * el manejo de cambios pendientes y el feedback de éxito/error.
 */
const useAsignaciones = () => {
    // --- 1. Estados de Datos ---
    const [personas, setPersonas] = useState([]);
    const [grupos, setGrupos] = useState([]);
    const [cambiosPendientes, setCambiosPendientes] = useState({}); // { personaId: nuevoGrupoId, ... }

    // --- 2. Estados de UI/Feedback ---
    const [error, setError] = useState('');
    const [exito, setExito] = useState('');
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // --- 3. Handlers de Feedback---

    const displaySuccess = useCallback((message) => {
        setExito(message);
        setError('');
        setTimeout(() => setExito(''), 3000);
    }, []);

    const displayError = useCallback((message) => {
        setError(message);
        setExito('');
        setTimeout(() => setError(''), 8000);
    }, []);

    // --- 4. Carga de Datos (API) ---

    // Carga inicial de todas las personas y todos los grupos
    const fetchAllData = useCallback(async () => {
        setLoading(true);
        try {
            const personasData = await apiFetch('/api/asignaciones/personas');
            const gruposData = await apiFetch('/api/asignaciones/grupos');
            
            setPersonas(personasData);
            setGrupos(gruposData);
            setCambiosPendientes({}); // Limpiar cambios al recargar
            displaySuccess('Datos de personas y grupos cargados correctamente.');
        } catch (err) {
            displayError(err.message || 'Error al cargar datos necesarios.');
        } finally {
            setLoading(false);
        }
    }, [displaySuccess, displayError]);

    // Ejecuta la carga inicial
    useEffect(() => {
        fetchAllData(); 
    }, [fetchAllData]);

    // --- 5. Handlers de Lógica de Asignación ---

    // Maneja el cambio de selección en el dropdown de un grupo para una persona
    const handleGrupoChange = (personaId, newGrupoId) => {
        setCambiosPendientes(prev => ({
            ...prev,
            [personaId]: newGrupoId === '' ? null : parseInt(newGrupoId)
        }));
    };

    // Envía la asignación modificada a la API
    const handleGuardarAsignacion = async (personaId) => {
        const nuevoGrupoId = cambiosPendientes[personaId];
        // Si no hay cambio pendiente, no hacemos nada
        if (nuevoGrupoId === undefined) return;

        setIsSaving(true);
        try {
            await apiFetch('/api/asignaciones/asignar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ personaId, grupoId: nuevoGrupoId })
            });
            
            displaySuccess(`Asignación guardada para la persona ID ${personaId}.`);
            
            // Actualizar el estado local de la lista de personas
            setPersonas(prevPersonas => prevPersonas.map(p => 
                p.Id === personaId 
                    ? { 
                        ...p, 
                        GrupoId: nuevoGrupoId,
                        GrupoNombre: grupos.find(g => g.Id === nuevoGrupoId)?.Nombre || 'Sin Grupo'
                      } 
                    : p
            ));

            // Eliminar el cambio de la lista de pendientes
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

    // --- 6. Retorno del Hook ---

    return {
        personas,
        grupos,
        cambiosPendientes,
        error,
        exito,
        loading,
        isSaving,
        fetchAllData, // Para recarga manual
        handleGrupoChange,
        handleGuardarAsignacion,
    };
};

export default useAsignaciones;