import React from 'react';
import usePermisos from '../../../hooks/seguridad/usePermisos';
import GenericConfirmModal from '../../../components/GenericConfirmModal';
import PermisoFormModal from '../../../components/PermisoFormModal';
import PermisoNode from '../../../components/PermisoNode';
import { FaPlus } from 'react-icons/fa';

const Permisos = () => {
    const {
        permisosPlano,
        permisosArbol,
        isLoadingAuth,
        isAllowed,
        error,
        exito,
        permisoAEditar,
        showFormModal,
        permisoAEliminar,
        showAccessDeniedModal,
        PERMISO_GESTIONAR,
        fetchPermisos,
        displaySuccess,
        displayError,
        handleAbrirEdicion,
        handleCerrarEdicion,
        handleAbrirConfirmacionEliminar,
        handleCerrarConfirmacionEliminar,
        confirmarEliminarPermiso,
        setShowAccessDeniedModal
    } = usePermisos();

    if (isLoadingAuth) {
        return <div className="container mt-4"><p className="text-primary fw-bold">Cargando permisos...</p></div>;
    }

    if (!isAllowed) {
        if (showAccessDeniedModal) {
            return (
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
            );
        }
        return <div className="container mt-4"><p className="text-muted">Verificando acceso...</p></div>;
    }

    return (
        <div className="container mt-4">
            <h3 className="mb-4">Gestión de Permisos</h3>
            
            {/* Mensajes de éxito y error (Se auto-limpian en el hook) */}
            {error && <div className="alert alert-danger shadow-sm">{error}</div>}
            {exito && <div className="alert alert-success shadow-sm">{exito}</div>}

            {/* Botón de Creación */}
            {isAllowed && !showFormModal && (
                <button onClick={() => handleAbrirEdicion(null)} className="btn btn-primary mb-3">
                    <FaPlus className="me-2" /> Crear Nuevo Permiso
                </button>
            )}

            {/* Modal de Formulario (Creación/Edición) */}
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
            <div className="table-responsive">
                <table className="table table-bordered table-striped mt-3 align-middle">
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
                            <tr><td colSpan="5" className="text-center">No hay permisos definidos.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

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