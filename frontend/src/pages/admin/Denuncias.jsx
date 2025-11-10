import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import useDenuncias from '../../hooks/seguridad/useDenuncias';
import DetalleDenunciaModal from '../../components/DetalleDenunciaModal';
import DenunciasFiltros from '../../components/DenunciasFiltros';
import DenunciasTabla from '../../components/TablaDenuncias';

const Denuncias = () => {
    const { tienePermiso, isLoading: isLoadingAuth } = useAuth();
    const PERMISO_VER_DENUNCIAS = 'ver_denuncias';

    // Usamos el custom hook, extrayendo los estados y handlers necesarios.
    const {
        denuncias, // Todas las denuncias sin filtro
        denunciasManejadas, // Denuncias filtradas y ordenadas
        loading,
        error,
        filtroBusqueda,
        setFiltroBusqueda,
        fechaInicio,
        setFechaInicio,
        fechaFin,
        setFechaFin,
        ordenamiento,
        handleSort,
        denunciaSeleccionada, 
        abrirModalDetalle, 
        cerrarModalDetalle,
    } = useDenuncias(tienePermiso, PERMISO_VER_DENUNCIAS);

    // El estado de carga incluye la autenticación y la carga de datos del hook.
    if (isLoadingAuth || loading) return <p className="mt-4">Cargando permisos y denuncias...</p>;

    if (!tienePermiso(PERMISO_VER_DENUNCIAS)) {
        return <h2 className="mt-4 text-danger">No tienes permiso para ver el listado de denuncias.</h2>;
    }

    return (
        <div className="container mt-4">
            <h3>Denuncias registradas</h3>
            <hr />
            {error && <div className="alert alert-danger">{error}</div>} 

            {/* --- Componente de Filtros --- */}
            <DenunciasFiltros
                filtroBusqueda={filtroBusqueda}
                setFiltroBusqueda={setFiltroBusqueda}
                fechaInicio={fechaInicio}
                setFechaInicio={setFechaInicio}
                fechaFin={fechaFin}
                setFechaFin={setFechaFin}
            />
            {/* --------------------------- */}

            {/* --- Componente de Tabla --- */}
            <DenunciasTabla
                denunciasManejadas={denunciasManejadas}
                totalDenuncias={denuncias.length}
                ordenamiento={ordenamiento}
                handleSort={handleSort}
                abrirModalDetalle={abrirModalDetalle}
                error={error}
            />
            {/* --------------------------- */}
            
            {/* Renderización del Modal */}
            <DetalleDenunciaModal 
                denuncia={denunciaSeleccionada} 
                onClose={cerrarModalDetalle} 
            />
        </div>
    );
};

export default Denuncias;