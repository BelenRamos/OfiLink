import React, { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../../../utils/apiFetch';
import AsignarRolesModal from '../../../components/AsignarRolesModal'; 
import TablaGrupos from '../../../components/TablaGrupos';
import FormularioGrupo from '../../../components/FormularioGrupo';
import { useAuth } from '../../../hooks/useAuth'; 
import GenericConfirmModal from '../../../components/GenericConfirmModal';

const Grupos = () => {
    const { tienePermiso, isLoading } = useAuth(); // 🔑 Obtener hooks de auth
    
    const PERMISO_GESTIONAR = 'gestionar_grupos'; // 🔑 Definir el permiso

    const [grupos, setGrupos] = useState([]);
    const [roles, setRoles] = useState([]); 
    const [error, setError] = useState('');
    const [exito, setExito] = useState('');
    const [modalGrupo, setModalGrupo] = useState(null); 
    const [grupoAEditar, setGrupoAEditar] = useState(null);
    const [showAccessDeniedModal, setShowAccessDeniedModal] = useState(false);
    const [grupoAEliminar, setGrupoAEliminar] = useState(null);


    const fetchGrupos = useCallback(async () => {
        try {
            const responseData = await apiFetch('/api/grupos');
            setGrupos(responseData);
            setError('');
        } catch (err) {
            setError('Error al cargar grupos. Verifique permisos.');
        }
    }, []);

    const fetchRoles = useCallback(async () => {
        try {
            const responseData = await apiFetch('/api/roles'); 
            setRoles(responseData);
        } catch (err) {
            console.error('Error al cargar la lista maestra de roles:', err);
        }
    }, []);

    useEffect(() => {
        fetchGrupos();
        fetchRoles();
    }, [fetchGrupos, fetchRoles]);

    // 🔑 Función para mostrar el modal de acceso denegado
    const handleAccessDenied = () => {
        setShowAccessDeniedModal(true);
    };
    
    // 🔑 useEffect para mostrar el modal si no hay permiso (Reemplaza el 'if' inicial)
    useEffect(() => {
        if (!isLoading && !tienePermiso(PERMISO_GESTIONAR)) {
            handleAccessDenied();
        }
    }, [isLoading, tienePermiso]);

    // ------------------------------------
    // ✅ FUNCIONES DE MANEJO DE ESTADO Y UI (Movidas aquí)
    // ------------------------------------

    // Funciones de Modal de Roles
    const abrirModalRoles = (grupo) => {
        setModalGrupo(grupo);
        setError('');
        setExito('');
    };

    const cerrarModalRoles = () => {
        setModalGrupo(null);
    };

    // Funciones de Edición de Grupo
    const abrirEdicion = (grupo) => {
        setGrupoAEditar(grupo);
        setError('');
        setExito('');
    };

    const cerrarEdicion = () => { // 🎯 ESTA ES LA FUNCIÓN QUE FALTABA ARRIBA
        setGrupoAEditar(null);
    };
    
    // --- Lógica de Eliminación (Usando Modal) ---

    // 🔑 Abre el modal de confirmación
    const handleAbrirConfirmacionEliminar = (grupo) => {
        setGrupoAEliminar(grupo);
    };

    // 🔑 Cierra el modal de confirmación
    const handleCerrarConfirmacionEliminar = () => {
        setGrupoAEliminar(null);
    };

    // 🔑 Función que realiza la eliminación
    const confirmarEliminarGrupo = async () => {
        const { Id, Nombre } = grupoAEliminar; // Usamos el estado

        try {
            await apiFetch(`/api/grupos/${Id}`, { method: 'DELETE' });
            setExito(`Grupo "${Nombre}" eliminado con éxito.`);
            fetchGrupos();
            setError('');
        } catch (err) {
            setError(err.message || 'Error al eliminar el grupo. Podría tener personas asociadas.');
        } finally {
             // Siempre cerramos el modal después de la acción
             setGrupoAEliminar(null); 
        }
    };

    // ----------------------------------------------------
    // 🔒 Renderizado Condicional y Mensajes
    // ----------------------------------------------------

    if (isLoading) return <div className="container mt-4"><p>Cargando permisos...</p></div>;

    // 🔒 Si el permiso no está cargado, renderizamos solo el modal de denegación, no el resto de la UI.
    if (!tienePermiso(PERMISO_GESTIONAR) && !showAccessDeniedModal) {
        // Esto previene que la UI parpadee. Si no tiene permiso, el useEffect ya lo mostrará.
        return <div className="container mt-4"><p>Verificando acceso...</p></div>; 
    }
    // ------------------------------------

    return (
        <div className="container mt-4">
            <h3>Gestión de Grupos y Roles</h3>
            
            {error && <div className="alert alert-danger">{error}</div>}
            {exito && <div className="alert alert-success">{exito}</div>}

            {/* Componente para Crear/Editar Grupo */}
            <FormularioGrupo 
                grupo={grupoAEditar}
                fetchGrupos={fetchGrupos} 
                setExito={setExito} 
                setError={setError}
                closeModal={cerrarEdicion}
            />
            
            {grupoAEditar && (
                <button className="btn btn-secondary btn-sm mb-3" onClick={cerrarEdicion}>
                    Cancelar Edición
                </button>
            )}

            {/* Componente de la Tabla de Grupos */}
            <TablaGrupos
                grupos={grupos}
                abrirModalRoles={abrirModalRoles}
                abrirEdicion={abrirEdicion}
                handleEliminarGrupo={handleAbrirConfirmacionEliminar} // 🔑 Usamos la función que abre el modal
            />

            {/* Modal para Asignación de Roles (sin cambios) */}
            {modalGrupo && (
                <AsignarRolesModal
                    grupo={modalGrupo}
                    todosLosRoles={roles}
                    cerrarModal={cerrarModalRoles}
                    setError={setError}
                    setExito={setExito}
                />
            )}

            {/* 🔑 MODAL DE DENEGACIÓN DE ACCESO */}
            <GenericConfirmModal
                show={showAccessDeniedModal}
                onClose={() => setShowAccessDeniedModal(false)}
                onConfirm={() => setShowAccessDeniedModal(false)} // En este caso, Aceptar solo cierra
                title="Acceso Denegado"
                message={`🚫 No tienes el permiso requerido (${PERMISO_GESTIONAR}) para ver o modificar esta sección.`}
                confirmText="Entendido"
                cancelText={null} // Ocultar el botón Cancelar
                confirmButtonClass="btn-warning"
            />

            {/* 🔑 MODAL DE CONFIRMACIÓN DE ELIMINACIÓN */}
            <GenericConfirmModal
                show={!!grupoAEliminar} // Muestra si hay un grupo en el estado
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