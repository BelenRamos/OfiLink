import React from 'react';
import useRoles from '../../../hooks/seguridad/useRoles'; 
import TablaRoles from '../../../components/TablaRoles'; 
import FormularioAgregarRol from '../../../components/FormularioAgregarRol';
import AsignarPermisosModal from '../../../components/AsignarPermisosModal';

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
        abrirModalPermisos, 
        cerrarModalPermisos,
        fetchRoles,
    } = useRoles();

    return (
        <div className="container mt-4">
            <h5 className="mb-4">Gestión de Roles y Permisos</h5>
            
            {/* Mensajes de feedback */}
            {error && <div className="alert alert-danger">{error}</div>}
            {exito && <div className="alert alert-success">{exito}</div>}

            {/* Formulario para agregar un nuevo rol */}
            <FormularioAgregarRol 
                fetchRoles={fetchRoles} // Para refrescar la lista
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
                    // No es necesario pasar fetchRoles aquí a menos que el modal
                    // necesite refrescar la lista global tras guardar.
                />
            )}
        </div>
    );
};

export default Roles;