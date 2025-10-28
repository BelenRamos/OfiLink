import React from 'react';
import { FaChevronRight, FaChevronDown } from 'react-icons/fa';

const PermisoAsignacionItem = ({ permiso, todos, expanded, toggleExpand, nivel = 0, rolPermisos, onTogglePermiso }) => {
    // Filtra los hijos de este permiso dentro de la lista completa
    const hijos = todos.filter(p => p.PadreId === permiso.Id);
    const isExpanded = expanded[permiso.Id] || false;
    const paddingLeft = nivel * 20;
    
    // Verifica si este permiso está asignado al rol
    const isChecked = rolPermisos.some(p => p.PermisoId === permiso.Id);
    
    // Si el permiso es null (puede pasar si la consulta de permisos trae nulos)
    if (!permiso || permiso.Id === null) return null;


    return (
        <li key={permiso.Id} style={{ paddingLeft: `${paddingLeft}px`, listStyle: 'none' }}>
            <div className="d-flex align-items-center">
                {hijos.length > 0 && (
                    <span onClick={() => toggleExpand(permiso.Id)} style={{ cursor: 'pointer', marginRight: '5px' }}>
                        {isExpanded ? <FaChevronDown size={10} /> : <FaChevronRight size={10} />}
                    </span>
                )}
                <input 
                    type="checkbox" 
                    id={`permiso-${permiso.Id}`} 
                    checked={isChecked}
                    onChange={() => onTogglePermiso(permiso.Id, isChecked)} 
                    className='me-2'
                />
                <label htmlFor={`permiso-${permiso.Id}`}>
                    {permiso.Nombre}
                </label>
            </div>
            {hijos.length > 0 && isExpanded && (
                <ul style={{ paddingLeft: '0px', margin: 0 }}>
                    {hijos.map(hijo => (
                        <PermisoAsignacionItem
                            key={hijo.Id}
                            permiso={hijo}
                            todos={todos}
                            expanded={expanded}
                            toggleExpand={toggleExpand}
                            nivel={nivel + 1}
                            rolPermisos={rolPermisos}
                            onTogglePermiso={onTogglePermiso}
                        />
                    ))}
                </ul>
            )}
        </li>
    );
};

export default PermisoAsignacionItem;