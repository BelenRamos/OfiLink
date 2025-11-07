import React from "react";
import useRegistro from "../hooks/useRegistro"; 

const FormularioRegistro = () => {
    // Usar el hook para obtener toda la lógica y estados
    const { 
        form, 
        error, 
        ok, 
        handleChange, 
        handleSubmit, 
        handleCancel 
    } = useRegistro();

    return (
        <div className="container mt-4">
            <h2>Registro</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            {ok && <div className="alert alert-success">{ok}</div>}
            <form onSubmit={handleSubmit} className="row g-3">
                <div className="col-12">
                    <label className="form-label">Nombre</label>
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
                    <label className="form-label">Correo electrónico</label>
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
                    <label className="form-label">Teléfono</label>
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
                    <label className="form-label">Fecha de nacimiento</label>
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
                    <label className="form-label">Contraseña</label>
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
                    <label className="form-label">Registrarme como</label>
                    <select
                        name="tipo_usuario"
                        value={form.tipo_usuario}
                        onChange={handleChange}
                        className="form-select"
                    >
                        <option value="cliente">Cliente</option>
                        <option value="trabajador">Trabajador</option>
                    </select>
                </div>

                <div className="col-12 mt-3 d-flex justify-content-between">
                    <button 
                        type="button" 
                        className="btn btn-secondary"
                        onClick={handleCancel}
                    >
                        Cancelar
                    </button>
                    <button type="submit" className="btn btn-primary">Continuar</button>
                </div>
            </form>
        </div>
    );
};

export default FormularioRegistro;