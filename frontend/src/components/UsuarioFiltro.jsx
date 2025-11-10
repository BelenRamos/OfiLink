import React from 'react';

/**
 * Componente de UI para filtrar la lista de usuarios por tipo.
 * @param {object} props
 * @param {string} props.filtroTipo - El valor actual del filtro.
 * @param {function} props.setFiltroTipo - Función para cambiar el estado del filtro.
 */
const UsuarioFiltro = ({ filtroTipo, setFiltroTipo }) => {
    return (
        <div className="d-flex justify-content-end align-items-center mb-3">
            <label className="form-label me-2 mb-0">Filtrar por tipo:</label>
            <select
                className="form-select w-auto"
                value={filtroTipo}
                onChange={e => setFiltroTipo(e.target.value)}
            >
                <option value="">Todos</option>
                <option value="cliente">Clientes</option>
                <option value="trabajador">Trabajadores</option>
                <option value="administrador">Administradores</option>
                <option value="supervisor">Supervisores</option>
            </select>
        </div>
    );
};

export default UsuarioFiltro;