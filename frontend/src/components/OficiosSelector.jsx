import React from "react";

const OficiosSelector = ({ oficios, oficiosSeleccionados, setOficiosSeleccionados }) => {
    //Espera el ID y lo convierte a número
    const handleCheckboxChange = (rawId) => {
        const id = parseInt(rawId, 10); 

        if (isNaN(id)) return; 
        
        if (oficiosSeleccionados.includes(id)) {
            setOficiosSeleccionados(oficiosSeleccionados.filter((o) => o !== id));
        } else {
            setOficiosSeleccionados([...oficiosSeleccionados, id]);
        }
    };

    return (
        <div className="form-group mt-3">
            <label>Oficios</label>
            <div className="border p-3 rounded">
                {oficios.length > 0 ? (
                    oficios.map((o) => (
                        <div className="form-check" key={o.Id}> 
                            <input
                                className="form-check-input"
                                type="checkbox"
                                id={`oficio-${o.Id}`} 
                                value={o.Id} 
                                checked={oficiosSeleccionados.includes(o.Id)} // OJO: 'includes' funciona bien si AMBOS son del mismo tipo (number o string)
                                onChange={() => handleCheckboxChange(o.Id)} 
                            />
                            <label className="form-check-label" htmlFor={`oficio-${o.Id}`}>
                                <strong>{o.Nombre}</strong> 
                            </label>
                        </div>
                    ))
                ) : (
                    <p>Cargando oficios...</p>
                )}
            </div>
        </div>
    );
};

export default OficiosSelector;