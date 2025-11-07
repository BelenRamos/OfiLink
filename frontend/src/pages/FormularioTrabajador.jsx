import React from "react";
import useRegistroTrabajador from "../hooks/useRegistroTrabajador"; 

const FormularioTrabajador = () => {
    // Usar el hook para obtener toda la lógica y estados
    const { 
        form, 
        zonas, 
        oficios, 
        loadingData, 
        error, 
        ok, 
        handleCheckboxChange, 
        handleTextChange, 
        handleSubmit, 
        handleCancel,
        shouldRender 
    } = useRegistroTrabajador();

    // Si el hook indica que no debe renderizar retorna null
    if (!shouldRender) {
        return null;
    }


    return (
        <div className="container mt-4">
            <h2>Registro de Trabajador</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            {ok && <div className="alert alert-success">{ok}</div>}
            
            <form onSubmit={handleSubmit} className="row g-3">
                <div className="col-12">
                    <label htmlFor="descripcion" className="form-label">
                        Descripción (Opcional)
                    </label>
                    <textarea
                        id="descripcion"
                        name="descripcion"
                        value={form.descripcion}
                        onChange={handleTextChange}
                        className="form-control"
                    ></textarea>
                </div>
                <div className="col-md-6">
                    <label htmlFor="disponibilidad_horaria" className="form-label">
                        Disponibilidad horaria
                    </label>
                    <input
                        type="text"
                        id="disponibilidad_horaria"
                        name="disponibilidad_horaria"
                        value={form.disponibilidad_horaria}
                        onChange={handleTextChange}
                        className="form-control"
                        placeholder="Ej: Lunes y Miércoles de 8 a 16"
                    />
                </div>
                
                {/* Zonas y Oficios */}
                {loadingData ? (
                    <div className="col-12 text-center">
                        <p>Cargando datos de oficios y zonas...</p>
                    </div>
                ) : (
                    <>
                        <div className="col-md-6">
                            <label className="form-label">Oficios</label>
                            <div className="border p-3 rounded h-48 overflow-y-auto">
                                {oficios.map((o) => (
                                    <div className="form-check" key={o.Id}>
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            id={`oficio-${o.Id}`}
                                            value={o.Id}
                                            name="oficiosIds"
                                            checked={form.oficiosIds.includes(o.Id)}
                                            onChange={handleCheckboxChange}
                                        />
                                        <label className="form-check-label" htmlFor={`oficio-${o.Id}`}>
                                            {o.Nombre}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Zonas</label>
                            <div className="border p-3 rounded h-48 overflow-y-auto">
                                {zonas.map((z) => (
                                    <div className="form-check" key={z.Id}>
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            id={`zona-${z.Id}`}
                                            value={z.Id}
                                            name="zonasIds"
                                            checked={form.zonasIds.includes(z.Id)}
                                            onChange={handleCheckboxChange}
                                        />
                                        <label className="form-check-label" htmlFor={`zona-${z.Id}`}>
                                            {z.Nombre}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
                
                <div className="col-12 mt-3 d-flex justify-content-between">
                    <button 
                        type="button" 
                        className="btn btn-secondary"
                        onClick={handleCancel}
                    >
                        Cancelar
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={loadingData}>
                        Registrar Trabajador
                    </button>
                </div>
            </form>
        </div>
    );
};

export default FormularioTrabajador;