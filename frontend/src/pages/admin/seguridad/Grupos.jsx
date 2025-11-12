import React from 'react';
import useGrupos from '../../../hooks/seguridad/useGrupos'; 
import AsignarRolesModal from '../../../components/AsignarRolesModal'; 
import TablaGrupos from '../../../components/TablaGrupos';
import FormularioGrupo from '../../../components/FormularioGrupo';
import GenericConfirmModal from '../../../components/GenericConfirmModal';

const Grupos = () => {
    const {
        grupos,
        roles,
        isLoadingAuth,
        isAllowed,
        error,
        exito,
        modalGrupo,
        grupoAEditar,
        grupoAEliminar,
        showAccessDeniedModal,
        PERMISO_GESTIONAR,
        fetchGrupos,
        setError,
        setExito,
        abrirModalRoles,
        cerrarModalRoles,
        abrirEdicion,
        cerrarEdicion,
        handleAbrirConfirmacionEliminar,
        handleCerrarConfirmacionEliminar,
        confirmarEliminarGrupo,
        setShowAccessDeniedModal
    } = useGrupos();

    if (isLoadingAuth) {
        return <div className="container mt-4"><p className="text-primary fw-bold">Cargando permisos...</p></div>;
    }

    // El hook se encarga de verificar y mostrar el modal de denegación, 
    // pero si el acceso es denegado, detenemos el renderizado del contenido principal.
    if (!isAllowed) {
        if (showAccessDeniedModal) {
            return (
                <GenericConfirmModal
                    show={showAccessDeniedModal}
                    onClose={() => setShowAccessDeniedModal(false)}
                    onConfirm={() => setShowAccessDeniedModal(false)}
                    title="Acceso Denegado"
                    message={`🚫 No tienes el permiso requerido (${PERMISO_GESTIONAR}) para ver o modificar esta sección.`}
                    confirmText="Entendido"
                    cancelText={null}
                    confirmButtonClass="btn-warning"
                />
            );
        }
        return <div className="container mt-4"><p className="text-muted">Verificando acceso...</p></div>;
    }
    
    // Se renderiza si isAllowed es true
    return (
        <div className="container mt-4">
            <h3 className="mb-4">Gestión de Grupos y Roles</h3>
            
            {/* Mensajes de éxito y error*/}
            {error && <div className="alert alert-danger shadow-sm">{error}</div>}
            {exito && <div className="alert alert-success shadow-sm">{exito}</div>}

            {/* Componente para Crear/Editar Grupo */}
            <FormularioGrupo 
                grupo={grupoAEditar}
                fetchGrupos={fetchGrupos} 
                setExito={setExito} 
                setError={setError}
                closeModal={cerrarEdicion}
            />
            
            {grupoAEditar && (
                <button className="btn btn-secondary btn-sm mb-3 mt-2" onClick={cerrarEdicion}>
                    Cancelar Edición
                </button>
            )}

            {/* Componente de la Tabla de Grupos */}
            <TablaGrupos
                grupos={grupos}
                abrirModalRoles={abrirModalRoles}
                abrirEdicion={abrirEdicion}
                handleEliminarGrupo={handleAbrirConfirmacionEliminar}
            />

            {/* Modal para Asignación de Roles */}
            {modalGrupo && (
                <AsignarRolesModal
                    grupo={modalGrupo}
                    todosLosRoles={roles}
                    cerrarModal={cerrarModalRoles}
                    setError={setError}
                    setExito={setExito}
                />
            )}

            {/* MODAL DE CONFIRMACIÓN DE ELIMINACIÓN */}
            <GenericConfirmModal
                show={!!grupoAEliminar} 
                onClose={handleCerrarConfirmacionEliminar}
                onConfirm={confirmarEliminarGrupo}
                title={`Eliminar Grupo: ${grupoAEliminar?.Nombre || ''}`}
                message={`¿Está seguro que desea eliminar el grupo "${grupoAEliminar?.Nombre || ''}"? Esta acción es irreversible y también eliminará la asignación de roles. Si tiene personas asociadas, no se podrá eliminar.`}
                confirmText="Sí, Eliminar"
                confirmButtonClass="btn-danger"
            />
            
        </div>
    );
};
export default Grupos;