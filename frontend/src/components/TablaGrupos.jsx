import React from 'react';
import { FaLockOpen, FaEdit, FaTrash } from 'react-icons/fa';

const TablaGrupos = ({ grupos, abrirModalRoles, abrirEdicion, handleEliminarGrupo }) => {

    return (
        <table className="table table-bordered table-striped mt-3">
            <thead className='table-dark'>
                <tr>
                    <th>ID</th>
                    <th>Nombre del Grupo</th>
                    <th style={{ width: '200px' }}>Acciones</th>
                </tr>
            </thead>
            <tbody>
                {grupos.map((grupo) => (
                    <tr key={grupo.Id}>
                        <td>{grupo.Id}</td>
                        <td>{grupo.Nombre}</td>
                        <td>
                            <button 
                                onClick={() => abrirModalRoles(grupo)} 
                                className="btn btn-info btn-sm me-2" 
                                title="Asignar Roles"
                            >
                                <FaLockOpen /> Roles
                            </button>
                            <button
                                onClick={() => abrirEdicion(grupo)}
                                className="btn btn-warning btn-sm me-2"
                                title="Editar Grupo"
                            >
                                <FaEdit />
                            </button>
                            <button
                                onClick={() => handleEliminarGrupo(grupo)}
                                className="btn btn-danger btn-sm"
                                title="Eliminar Grupo"
                            >
                                <FaTrash />
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default TablaGrupos;