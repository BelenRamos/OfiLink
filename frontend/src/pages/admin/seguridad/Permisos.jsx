import React, { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../../../utils/apiFetch';
import { useAuth } from '../../../hooks/useAuth';
import GenericConfirmModal from '../../../components/GenericConfirmModal';
import PermisoFormModal from '../../../components/PermisoFormModal';
import PermisoNode from '../../../components/PermisoNode';
import { arrayToTree } from '../../../utils/arrayToTree';
import { FaPlus } from 'react-icons/fa';

const Permisos = () => {
    const { tienePermiso, isLoading } = useAuth();
    const PERMISO_GESTIONAR = 'gestionar_permisos';

    const [permisosPlano, setPermisosPlano] = useState([]);
    const [permisosArbol, setPermisosArbol] = useState([]);
    const [error, setError] = useState('');
    const [exito, setExito] = useState('');
    const [permisoAEditar, setPermisoAEditar] = useState(null); 
    const [showFormModal, setShowFormModal] = useState(false); 
    const [permisoAEliminar, setPermisoAEliminar] = useState(null); 
    const [showAccessDeniedModal, setShowAccessDeniedModal] = useState(false);

    const fetchPermisos = useCallback(async () => {
        try {
            const dataPlana = await apiFetch('/api/permisos');
            setPermisosPlano(dataPlana);
            setPermisosArbol(arrayToTree(dataPlana)); 
            setError('');
        } catch (err) {
            setError(err.message || 'Error al cargar permisos. Verifique permisos.');
        }
    }, []);

    useEffect(() => {
        if (!isLoading && tienePermiso(PERMISO_GESTIONAR)) {
            fetchPermisos();
        } else if (!isLoading && !tienePermiso(PERMISO_GESTIONAR)) {
            setShowAccessDeniedModal(true);
        }
    }, [isLoading, tienePermiso, fetchPermisos]);

    const displaySuccess = (message) => {
        setExito(message);
        setTimeout(() => {
            setExito('');
        }, 3000); 
    };

    const displayError = (message) => {
        setError(message);
        setTimeout(() => {
            setError('');
        }, 6000); 
    };


    const handleAbrirEdicion = (permiso = null) => {
        setPermisoAEditar(permiso);
        setShowFormModal(true); 
        setError('');
        setExito('');
    };

    const handleCerrarEdicion = () => {
        setPermisoAEditar(null);
        setShowFormModal(false); 
    };

    const handleAbrirConfirmacionEliminar = (permiso) => {
        setPermisoAEliminar(permiso);
    };

    const handleCerrarConfirmacionEliminar = () => {
        setPermisoAEliminar(null);
    };

    const confirmarEliminarPermiso = async () => {
        const { Id, Nombre } = permisoAEliminar;

        try {
            await apiFetch(`/api/permisos/${Id}`, { method: 'DELETE' });
            displaySuccess(`Permiso "${Nombre}" eliminado con éxito.`); 
            fetchPermisos();
        } catch (err) {
            displayError(err.message || 'Error al eliminar el permiso. Verifique que no tenga permisos hijos asociados.'); 
            setPermisoAEliminar(null);
        }
    };
    
    if (!tienePermiso(PERMISO_GESTIONAR) && !showAccessDeniedModal) {
        return <div className="container mt-4"><p>Verificando acceso...</p></div>; 
    }

    return (
        <div className="container mt-4">
            <h3>Gestión de Permisos</h3>
            
            {error && <div className="alert alert-danger">{error}</div>}
            {exito && <div className="alert alert-success">{exito}</div>}

            {tienePermiso(PERMISO_GESTIONAR) && !showFormModal && (
                <button onClick={() => handleAbrirEdicion(null)} className="btn btn-primary mb-3">
                    <FaPlus /> Crear Nuevo Permiso
                </button>
            )}

            <PermisoFormModal
                show={showFormModal} 
                onClose={handleCerrarEdicion}
                permiso={permisoAEditar}
                todosLosPermisos={permisosPlano}
                fetchPermisos={fetchPermisos}
                setExito={displaySuccess} 
                setError={displayError} 
            />

            {/* Tabla / Árbol de Permisos*/}
            <table className="table table-bordered table-striped mt-3">
                <thead className='table-dark'>
                    <tr>
                        <th>Permiso</th>
                        <th>Descripción</th>
                        <th style={{ width: '50px' }}>ID</th>
                        <th style={{ width: '50px' }}>Padre</th>
                        <th style={{ width: '150px' }}>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {permisosArbol.length > 0 ? (
                        permisosArbol.map(permiso => (
                            <PermisoNode
                                key={permiso.Id}
                                permiso={permiso}
                                nivel={0}
                                onEdit={handleAbrirEdicion}
                                onDelete={handleAbrirConfirmacionEliminar}
                                todosLosPermisos={permisosPlano}
                            />
                        ))
                    ) : (
                        <tr><td colSpan="5">No hay permisos definidos.</td></tr>
                    )}
                </tbody>
            </table>

            <GenericConfirmModal
                show={showAccessDeniedModal}
                onClose={() => setShowAccessDeniedModal(false)}
                onConfirm={() => setShowAccessDeniedModal(false)}
                title="Acceso Denegado"
                message={`🚫 No tienes el permiso requerido (${PERMISO_GESTIONAR}) para gestionar permisos.`}
                confirmText="Entendido"
                cancelText={null}
                confirmButtonClass="btn-warning"
            />

            <GenericConfirmModal
                show={!!permisoAEliminar}
                onClose={handleCerrarConfirmacionEliminar}
                onConfirm={confirmarEliminarPermiso}
                title={`Eliminar Permiso: ${permisoAEliminar?.Nombre || ''}`}
                message={`¿Está seguro que desea eliminar el permiso "${permisoAEliminar?.Nombre || ''}"? Esta acción eliminará todas las referencias a este permiso (Roles, Formularios, Componentes). NO puede eliminar si tiene permisos hijos.`}
                confirmText="Sí, Eliminar"
                confirmButtonClass="btn-danger"
            />
        </div>
    );
};

export default Permisos;