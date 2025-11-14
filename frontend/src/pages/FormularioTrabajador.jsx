import React from "react";
import useRegistroTrabajador from "../hooks/useRegistroTrabajador"; 

const FormularioTrabajador = () => {
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

    if (!shouldRender) return null;

    return (
        <div className="container mt-4" style={{ maxWidth: "700px" }}>
            <h2 className="mb-3" style={{ fontWeight: "600" }}>Registro de Trabajador</h2>

            {error && <div className="alert alert-danger">{error}</div>}
            {ok && <div className="alert alert-success">{ok}</div>}

            <form onSubmit={handleSubmit} className="row g-3">

                {/* Descripción */}
                <div className="col-12">
                    <label className="form-label fw-semibold">Descripción (Opcional)</label>
                    <textarea
                        name="descripcion"
                        value={form.descripcion}
                        onChange={handleTextChange}
                        className="form-control"
                        style={{ minHeight: "90px" }}
                    ></textarea>
                </div>

                {/* Disponibilidad */}
                <div className="col-md-6">
                    <label className="form-label fw-semibold">Disponibilidad horaria</label>
                    <input
                        type="text"
                        name="disponibilidad_horaria"
                        value={form.disponibilidad_horaria}
                        onChange={handleTextChange}
                        className="form-control"
                        placeholder="Ej: Lunes y Miércoles de 8 a 16"
                    />
                </div>

                {/* Listas */}
                {loadingData ? (
                    <div className="col-12 text-center">
                        <p>Cargando datos de oficios y zonas...</p>
                    </div>
                ) : (
                    <>
                        {/* OFICIOS */}
                        <div className="col-md-6">
                            <label className="form-label fw-semibold">Oficios</label>
                            <div 
                                className="border p-3 rounded"
                                style={{
                                    maxHeight: "220px",
                                    overflowY: "auto",
                                    background: "#fafafa"
                                }}
                            >
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

                        {/* ZONAS */}
                        <div className="col-md-6">
                            <label className="form-label fw-semibold">Zonas</label>
                            <div 
                                className="border p-3 rounded"
                                style={{
                                    maxHeight: "220px",
                                    overflowY: "auto",
                                    background: "#fafafa"
                                }}
                            >
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

                {/* Botones */}
                <div className="col-12 mt-4 d-flex justify-content-between">
                    
                    {/* CANCELAR */}
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="btn"
                        style={{
                            backgroundColor: "rgb(205, 148, 193)",
                            color: "white",
                            fontWeight: "600",
                            padding: "8px 18px",
                            borderRadius: "6px",
                            border: "none"
                        }}
                    >
                        Cancelar
                    </button>

                    {/* SUBMIT */}
                    <button
                        type="submit"
                        disabled={loadingData}
                        className="btn"
                        style={{
                            backgroundColor: "rgb(212, 226, 113)",
                            color: "#2d3035",
                            fontWeight: "600",
                            padding: "8px 18px",
                            borderRadius: "6px",
                            border: "none"
                        }}
                    >
                        Registrar Trabajador
                    </button>
                </div>
            </form>
        </div>
    );
};

export default FormularioTrabajador;
