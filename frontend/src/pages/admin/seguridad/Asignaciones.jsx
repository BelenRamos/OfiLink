import React from 'react';
import { FaSync } from 'react-icons/fa';
import useAsignaciones from '../../../hooks/seguridad/useAsignaciones'; 
import PersonaAsignacionFila from '../../../components/PersonaAsignacionFila'; 

const Asignaciones = () => { 
    const {
        personas,
        grupos,
        cambiosPendientes,
        error,
        exito,
        loading,
        isSaving,
        fetchAllData,
        handleGrupoChange,
        handleGuardarAsignacion,
    } = useAsignaciones();

    if (loading) {
        return <div className="container mt-4"><p className="text-center text-primary">Cargando datos de personas y grupos...</p></div>;
    }

    return (
        <div className="container mt-4">
            <h3 className="mb-4">👥 Asignación de Grupos a Personas</h3>
            
            {/* Mensajes de feedback */}
            {error && <div className="alert alert-danger">{error}</div>}
            {exito && <div className="alert alert-success">{exito}</div>}

            <button 
                className="btn btn-secondary mb-3 d-flex align-items-center" 
                onClick={fetchAllData} 
                disabled={loading || isSaving}
            >
                <FaSync className={loading || isSaving ? 'animate-spin me-2' : 'me-2'} /> 
                {loading ? 'Cargando...' : 'Recargar Datos'}
            </button>

            <div className="table-responsive">
                <table className="table table-bordered table-striped align-middle">
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
                        {personas.length === 0 && (
                            <tr>
                                <td colSpan="4" className="text-center text-muted">No se encontraron personas para asignar.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Asignaciones;