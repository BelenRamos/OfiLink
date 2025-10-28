import React, { useState } from 'react';
import axios from 'axios';
import { FaEdit, FaTrashAlt, FaLockOpen } from 'react-icons/fa';

const TablaRoles = ({ roles, fetchRoles, setError, setExito, abrirModalPermisos }) => {
    const [editandoRol, setEditandoRol] = useState(null); 
    const [nombreEditado, setNombreEditado] = useState('');

    const iniciarEdicion = (rol) => {
        setEditandoRol(rol.Id);
        setNombreEditado(rol.Nombre);
        setError(''); // Limpiar errores al iniciar edición
    };

    const handleGuardarEdicion = async (rolId) => {
        setError('');
        setExito('');

        if (!nombreEditado.trim()) {
            setError('El nombre no puede estar vacío');
            return;
        }

        try {
            await axios.put(`/api/roles/${rolId}`, { nombre: nombreEditado }); 
            setExito('Rol actualizado con éxito');
            setEditandoRol(null);
            fetchRoles(); // Refrescar la lista
        } catch (err) {
            setError(err.response?.data?.error || 'Error al actualizar el rol');
        }
    };

    const handleEliminarRol = async (rolId) => {
        if (!window.confirm('¿Está seguro de que desea eliminar este rol?')) return;
        setError('');
        setExito('');

        try {
            await axios.delete(`/api/roles/${rolId}`); 
            setExito('Rol eliminado con éxito');
            fetchRoles(); // Refrescar la lista
        } catch (err) {
            setError(err.response?.data?.error || 'Error al eliminar el rol');
        }
    };

    return (
        <table className="table table-bordered table-striped">
            <thead className='table-dark'>
                <tr>
                    <th style={{ width: '50px' }}>ID</th>
                    <th>Nombre del Rol</th>
                    <th style={{ width: '150px' }}>Acciones</th>
                </tr>
            </thead>
            <tbody>
                {roles.map((rol) => (
                    <tr key={rol.Id}>
                        <td>{rol.Id}</td>
                        <td>
                            {editandoRol === rol.Id ? (
                                <input
                                    type="text"
                                    className="form-control form-control-sm"
                                    value={nombreEditado}
                                    onChange={(e) => setNombreEditado(e.target.value)}
                                />
                            ) : (
                                rol.Nombre
                            )}
                        </td>
                        <td>
                            {editandoRol === rol.Id ? (
                                <button onClick={() => handleGuardarEdicion(rol.Id)} className="btn btn-success btn-sm me-2">Guardar</button>
                            ) : (
                                <>
                                    <button 
                                        onClick={() => iniciarEdicion(rol)} 
                                        className="btn btn-warning btn-sm me-1" 
                                        title="Editar Nombre"
                                    >
                                        <FaEdit />
                                    </button>
                                    <button 
                                        onClick={() => abrirModalPermisos(rol)} 
                                        className="btn btn-info btn-sm me-1" 
                                        title="Gestionar Permisos"
                                    >
                                        <FaLockOpen />
                                    </button>
                                    <button 
                                        onClick={() => handleEliminarRol(rol.Id)} 
                                        className="btn btn-danger btn-sm"
                                        title="Eliminar Rol"
                                    >
                                        <FaTrashAlt />
                                    </button>
                                </>
                            )}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default TablaRoles;