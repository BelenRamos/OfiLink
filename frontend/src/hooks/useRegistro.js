import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/apiFetch";

/**
 * Hook personalizado para gestionar la lógica del Formulario de Registro (Paso 1).
 */
const useRegistro = () => {
    const navigate = useNavigate();

    // 1. Estados
    const [form, setForm] = useState({
        nombre: "",
        mail: "",
        contacto: "",
        fecha_nacimiento: "",
        contraseña: "",
        tipo_usuario: "cliente",
    });

    const [error, setError] = useState("");
    const [ok, setOk] = useState("");

    // 2. Handlers de Interfaz
    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    }, []);

    const handleCancel = useCallback(() => {
        // Redirige al usuario a la página de inicio
        navigate("/"); 
    }, [navigate]);

    // 3. Validación
    const validar = useCallback(() => {
        const { mail, contacto, fecha_nacimiento, contraseña } = form;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(mail)) return "El mail no es válido.";

        if (!/^\d{9,}$/.test(contacto)) return "El teléfono debe tener al menos 9 números.";

        if (!fecha_nacimiento) return "Falta la fecha de nacimiento.";
        
        const nacimiento = new Date(fecha_nacimiento);
        const hoy = new Date();
        let edad = hoy.getFullYear() - nacimiento.getFullYear();
        const m = hoy.getMonth() - nacimiento.getMonth();
        if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) edad--;
        if (edad < 18) return "El usuario debe ser mayor de 18 años.";

        if (!contraseña || contraseña.length < 8) return "La contraseña debe tener al menos 8 caracteres.";

        return null;
    }, [form]);

    // 4. Envío del Formulario
    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        setError("");
        setOk("");

        const msg = validar();
        if (msg) return setError(msg);

        if (form.tipo_usuario === "trabajador") {
            // Si es trabajador, pasa al siguiente paso con los datos actuales
            return navigate("/formularioTrabajador", { state: form, replace: false });
        }

        try {
            // Si es cliente, registra directamente
            await apiFetch("/api/personas/registrar", {
                method: 'POST',
                body: { 
                    ...form,
                    descripcion: null,
                    disponibilidad_horaria: null,
                    oficiosIds: null,
                    zonasIds: null,
                }
            });

            setOk("Usuario registrado correctamente.");
            // Navega a login después de un registro exitoso de cliente
            navigate("/login");
        } catch (err) {
            const apiErr = err.message || "Error al registrar usuario.";
            setError(apiErr);
        }
    }, [form, validar, navigate]);

    return {
        form,
        error,
        ok,
        handleChange,
        handleSubmit,
        handleCancel,
        setError, 
        setOk
    };
};

export default useRegistro;