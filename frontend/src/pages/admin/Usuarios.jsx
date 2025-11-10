import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import useUsuarios from '../../hooks/seguridad/useUsuarios'; 
import GenericConfirmModal from '../../components/GenericConfirmModal';
import ConfirmBlockModal from '../../components/ConfirmBlockModal';
import UsuarioFiltro from '../../components/UsuarioFiltro';
import TablaUsuarios from '../../components/TablaUsuarios'; 

const Usuarios = () => {
    const authContext = useAuth();
    
    const { 
        usuarios,
        loading,
        mensaje, 
        filtroTipo,
        setFiltroTipo,
        showConfirmModal,
        targetUsuario,
        modalProps,
        openConfirmModal,
        closeConfirmModal,
        handleConfirmAction,
        ACTION_RESET,
        ACTION_DELETE,
        ACTION_BLOCK,
        puedeVer,
        puedeBloquear,
        puedeEliminar,
        puedeResetear,
        isLoadingAuth,
    } = useUsuarios(authContext);

    // Renderizado de estado de carga y permisos
    if (isLoadingAuth || loading) return <p className="mt-4 container">Cargando permisos y usuarios...</p>;

    if (!puedeVer) {
        return <h2 className="mt-4 container text-danger">No tienes permiso para ver la gestión de usuarios.</h2>;
    }

   return (
        <div className="container mt-4">
            <h2>Gestión de Usuarios</h2>
            
            {/* ESTA LÍNEA MUESTRA EL MENSAJE (incluyendo la nueva contraseña) */}
            {mensaje && <div className="alert alert-info">{mensaje}</div>} 

            {/* Componente para el filtro */}
            <UsuarioFiltro 
                filtroTipo={filtroTipo} 
                setFiltroTipo={setFiltroTipo} 
            />

            {/* Componente de la tabla */}
            <TablaUsuarios
                usuarios={usuarios}
                openConfirmModal={openConfirmModal}
                ACTION_RESET={ACTION_RESET}
                ACTION_BLOCK={ACTION_BLOCK}
                ACTION_DELETE={ACTION_DELETE}
                puedeResetear={puedeResetear}
                puedeBloquear={puedeBloquear}
                puedeEliminar={puedeEliminar}
            />
          
            {/* Manejo de Modales (No requiere cambios) */}
            {showConfirmModal && modalProps.useInputModal && targetUsuario && (
                <ConfirmBlockModal
                    show={showConfirmModal}
                    onClose={closeConfirmModal}
                    onConfirm={handleConfirmAction} 
                    {...modalProps}
                />
            )}

            {showConfirmModal && !modalProps.useInputModal && (
                <GenericConfirmModal
                    show={showConfirmModal}
                    onClose={closeConfirmModal}
                    // La función de confirmación se encargará de pasar los argumentos de motivo/duración
                    onConfirm={() => handleConfirmAction(null, null)} 
                    {...modalProps}
                />
            )}
        </div>
    );
};


export default Usuarios;