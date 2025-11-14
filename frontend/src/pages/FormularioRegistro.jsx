import React from "react";
import useRegistro from "../hooks/useRegistro";

const FormularioRegistro = () => {
    const { 
        form, 
        error, 
        ok, 
        handleChange, 
        handleSubmit, 
        handleCancel 
    } = useRegistro();

    return (
        <div className="container mt-5 mb-5" style={{ maxWidth: "700px" }}>
            <h2 
                className="fw-bold mb-4 text-center"
                style={{ color: "rgb(45, 48, 53)" }}
            >
                Registro
            </h2>

            {error && (
                <div className="alert alert-danger shadow-sm rounded-3">
                    {error}
                </div>
            )}

            {ok && (
                <div className="alert alert-success shadow-sm rounded-3">
                    {ok}
                </div>
            )}

            <form 
                onSubmit={handleSubmit} 
                className="row g-3 p-4 shadow-sm rounded-4"
                style={{
                    background: "white",
                    border: "1px solid #eee"
                }}
            >
                <div className="col-12">
                    <label className="form-label fw-semibold">
                        Nombre
                    </label>
                    <input
                        type="text"
                        name="nombre"
                        value={form.nombre}
                        onChange={handleChange}
                        className="form-control"
                        required
                    />
                </div>

                <div className="col-12">
                    <label className="form-label fw-semibold">
                        Correo electrónico
                    </label>
                    <input
                        type="email"
                        name="mail"
                        value={form.mail}
                        onChange={handleChange}
                        className="form-control"
                        required
                    />
                </div>

                <div className="col-md-6">
                    <label className="form-label fw-semibold">Teléfono</label>
                    <input
                        type="text"
                        name="contacto"
                        value={form.contacto}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="Ej: 112233445"
                        required
                    />
                </div>

                <div className="col-md-6">
                    <label className="form-label fw-semibold">
                        Fecha de nacimiento
                    </label>
                    <input
                        type="date"
                        name="fecha_nacimiento"
                        value={form.fecha_nacimiento}
                        onChange={handleChange}
                        className="form-control"
                        required
                    />
                </div>

                <div className="col-md-6">
                    <label className="form-label fw-semibold">
                        Contraseña
                    </label>
                    <input
                        type="password"
                        name="contraseña"
                        value={form.contraseña}
                        onChange={handleChange}
                        className="form-control"
                        minLength={6}
                        required
                    />
                </div>

                <div className="col-md-6">
                    <label className="form-label fw-semibold">
                        Registrarme como
                    </label>
                    <select
                        name="tipo_usuario"
                        value={form.tipo_usuario}
                        onChange={handleChange}
                        className="form-select"
                        style={{ cursor: "pointer" }}
                    >
                        <option value="cliente">Cliente</option>
                        <option value="trabajador">Trabajador</option>
                    </select>
                </div>

                {/* Botones */}
                <div className="col-12 mt-4 d-flex justify-content-between">
                    <button
                        type="button"
                        className="btn px-4"
                        onClick={handleCancel}
                        style={{
                            background: "rgb(205, 148, 193)",
                            border: "none",
                            color: "white",
                            fontWeight: "600"
                        }}
                    >
                        Cancelar
                    </button>

                    <button
                        type="submit"
                        className="btn px-4"
                        style={{
                            background: "rgb(45, 48, 53)",
                            color: "white",
                            fontWeight: "600"
                        }}
                    >
                        Continuar
                    </button>
                </div>
            </form>
        </div>
    );
};

export default FormularioRegistro;
