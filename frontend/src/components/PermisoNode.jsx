import React, { useState } from 'react';
import { FaEdit, FaTrash, FaChevronRight, FaChevronDown } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth'; 

const PermisoNode = ({ permiso, nivel, onEdit, onDelete, todosLosPermisos }) => {
    const [isOpen, setIsOpen] = useState(false);
    const hasChildren = permiso.hijos && permiso.hijos.length > 0;
    const paddingLeft = { paddingLeft: `${nivel * 20 + 5}px` };
    
    const { tienePermiso } = useAuth(); // 🔑 Llamar al hook de autenticación
    const CAN_MANAGE = tienePermiso('gestionar_permisos'); // El permiso de gestión

    return (
        <>
            <tr key={permiso.Id} style={{ ...paddingLeft }}>
                <td style={{ fontWeight: nivel === 0 ? 'bold' : 'normal' }}>
                    {hasChildren && (
                        <span onClick={() => setIsOpen(!isOpen)} style={{ cursor: 'pointer', marginRight: '5px' }}>
                            {isOpen ? <FaChevronDown /> : <FaChevronRight />}
                        </span>
                    )}
                    {permiso.Nombre}
                </td>
                <td>{permiso.Descripcion || '-'}</td>
                <td>{permiso.Id}</td>
                <td>{permiso.PadreId || '-'}</td>
                <td style={{ width: '150px' }}>
                    <button 
                        onClick={() => onEdit(permiso)} 
                        className="btn btn-warning btn-sm me-2" 
                        title="Editar Permiso"
                        disabled={!CAN_MANAGE}
                    >
                        <FaEdit />
                    </button>
                    <button 
                        onClick={() => onDelete(permiso)} 
                        className="btn btn-danger btn-sm" 
                        title="Eliminar Permiso"
                        disabled={!CAN_MANAGE}
                    >
                        <FaTrash />
                    </button>
                </td>
            </tr>
            
            {/* Llamada recursiva (debe llamarse a sí mismo: PermisoNode) */}
            {isOpen && hasChildren && permiso.hijos.map(hijo => (
                <PermisoNode
                    key={hijo.Id}
                    permiso={hijo}
                    nivel={nivel + 1}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    todosLosPermisos={todosLosPermisos}
                />
            ))}
        </>
    );
};

export default PermisoNode;