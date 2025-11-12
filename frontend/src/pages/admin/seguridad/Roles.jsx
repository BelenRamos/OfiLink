import React from 'react';
import useRoles from '../../../hooks/seguridad/useRoles'; 
import TablaRoles from '../../../components/TablaRoles'; 
import FormularioAgregarRol from '../../../components/FormularioAgregarRol';
import AsignarPermisosModal from '../../../components/AsignarPermisosModal';
import GenericConfirmModal from '../../../components/GenericConfirmModal'; // Asegúrate de que este import sea correcto

const Roles = () => {
    // Consumimos el hook para obtener toda la funcionalidad y estados
    const {
        roles, 
        todosLosPermisos,
        error, 
        setError, 
        exito, 
        setExito,
        expanded, 
        toggleExpand,
        modalRol, 
        rolAEliminar, // Nuevo estado para el modal de confirmación
        abrirModalPermisos, 
        cerrarModalPermisos,
        handleAbrirConfirmacionEliminar, // Nuevo handler
        handleCerrarConfirmacionEliminar, // Nuevo handler
        confirmarEliminarRol, // Nueva acción
        fetchRoles,
    } = useRoles();

    return (
        <div className="container mt-4">
            <h5 className="mb-4">Gestión de Roles y Permisos</h5>
            
            {/* Mensajes de feedback */}
            {error && <div className="alert alert-danger shadow-sm">{error}</div>}
            {exito && <div className="alert alert-success shadow-sm">{exito}</div>}

            {/* Formulario para agregar un nuevo rol */}
            <FormularioAgregarRol 
                fetchRoles={fetchRoles} 
                setError={setError} 
                setExito={setExito}
            />
            
            <hr className="my-4"/>

            {/* Tabla de Roles (CRUD) */}
            <TablaRoles
                roles={roles}
                fetchRoles={fetchRoles}
                setError={setError}
                setExito={setExito}
                abrirModalPermisos={abrirModalPermisos}
                // PASAMOS LA FUNCIÓN PARA ABRIR EL MODAL GENÉRICO
                onDelete={handleAbrirConfirmacionEliminar} 
            />

            {/* Modal para Asignación de Permisos */}
            {modalRol && (
                <AsignarPermisosModal
                    rol={modalRol}
                    todosLosPermisos={todosLosPermisos}
                    cerrarModal={cerrarModalPermisos}
                    setError={setError}
                    setExito={setExito}
                    expanded={expanded} 
                    toggleExpand={toggleExpand}
                />
            )}

            {/* Modal de Confirmación de Eliminación */}
            <GenericConfirmModal
                show={!!rolAEliminar} // Muestra si hay un rol seleccionado para eliminar
                onClose={handleCerrarConfirmacionEliminar}
                onConfirm={confirmarEliminarRol}
                title={`Eliminar Rol: ${rolAEliminar?.Nombre || ''}`}
                message={`¿Está seguro que desea eliminar el rol "${rolAEliminar?.Nombre || ''}"? Esta acción no se puede deshacer y desasignará el rol a todos los usuarios.`}
                confirmText="Sí, Eliminar Rol"
                cancelText="Cancelar"
                confirmButtonClass="btn-danger"
            />
        </div>
    );
};

export default Roles;