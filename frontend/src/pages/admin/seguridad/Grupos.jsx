import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FaLockOpen } from 'react-icons/fa';
import AsignarRolesModal from '../../../components/AsignarRolesModal'; // Componente nuevo

const Grupos = () => {
    const [grupos, setGrupos] = useState([]);
    const [roles, setRoles] = useState([]); // Lista de todos los Roles disponibles
    const [error, setError] = useState('');
    const [exito, setExito] = useState('');
    const [modalGrupo, setModalGrupo] = useState(null); // Grupo seleccionado

    // 1. Obtener la lista de Grupos
    const fetchGrupos = useCallback(async () => {
        try {
            const response = await axios.get('/api/grupos');
            setGrupos(response.data);
        } catch (err) {
            setError('Error al cargar grupos.');
        }
    }, []);

    // 2. Obtener la lista de todos los Roles disponibles
    const fetchRoles = useCallback(async () => {
        try {
            const response = await axios.get('/api/roles'); // Reutilizamos el endpoint de Roles
            setRoles(response.data);
        } catch (err) {
            console.error('Error al cargar la lista maestra de roles:', err);
        }
    }, []);

    useEffect(() => {
        fetchGrupos();
        fetchRoles();
    }, [fetchGrupos, fetchRoles]);

    const abrirModalRoles = (grupo) => {
        setModalGrupo(grupo);
        setError('');
        setExito('');
    };

    const cerrarModalRoles = () => {
        setModalGrupo(null);
    };

    return (
        <div>
            <h5>Gestión de Grupos y Roles</h5>
            
            {error && <div className="alert alert-danger">{error}</div>}
            {exito && <div className="alert alert-success">{exito}</div>}

            {/* Aquí iría el formulario para crear un nuevo Grupo, si fuera necesario */}

            <table className="table table-bordered table-striped mt-3">
                <thead className='table-dark'>
                    <tr>
                        <th>ID</th>
                        <th>Nombre del Grupo</th>
                        <th style={{ width: '100px' }}>Acciones</th>
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
                                    className="btn btn-info btn-sm" 
                                    title="Asignar Roles"
                                >
                                    <FaLockOpen /> Roles
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

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
        </div>
    );
};

export default Grupos;