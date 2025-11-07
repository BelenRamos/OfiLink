import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/apiFetch";

/**
 * Hook personalizado para gestionar la lógica del Formulario de Registro de Trabajador (Paso 2).
 */
const useRegistroTrabajador = () => {
    const { state } = useLocation();
    const navigate = useNavigate();

    // Redirigir si no hay estado del paso anterior (datos personales)
    if (!state) {
        navigate("/registro");
        return { shouldRender: false };
    }

    // 1. Estados
    const [form, setForm] = useState({
        ...state,
        descripcion: "",
        disponibilidad_horaria: "",
        oficiosIds: [],
        zonasIds: [],
    });

    const [zonas, setZonas] = useState([]);
    const [oficios, setOficios] = useState([]);
    const [loadingData, setLoadingData] = useState(true);
    const [error, setError] = useState("");
    const [ok, setOk] = useState("");

    // 2. Fetching de Zonas y Oficios
    const fetchData = useCallback(async () => {
        setLoadingData(true);
        try {
            const [resZonas, resOficios] = await Promise.all([
                apiFetch("/api/zonas"), 
                apiFetch("/api/oficios"), 
            ]);

            setZonas(resZonas); 
            setOficios(resOficios);
        } catch (err) {
            console.error("Error cargando datos:", err);
            setError("Error al cargar zonas y oficios.");
        } finally {
            setLoadingData(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // 3. Handlers de Interfaz
    const handleCheckboxChange = useCallback((e) => {
        const { name, value, checked } = e.target;
        setForm((prev) => {
            const currentArray = prev[name];
            const updatedArray = checked
                ? [...currentArray, parseInt(value)]
                : currentArray.filter((id) => id !== parseInt(value));
            return { ...prev, [name]: updatedArray };
        });
    }, []);

    const handleTextChange = useCallback((e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    }, []);

    const handleCancel = useCallback(() => {
        // Sale del formulario
        navigate("/"); 
    }, [navigate]);


    // 4. Envío del Formulario
    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        setError("");
        setOk("");

        if (form.oficiosIds.length === 0) {
            return setError("Debe seleccionar al menos un oficio.");
        }
        if (form.zonasIds.length === 0) {
            return setError("Debe seleccionar al menos una zona.");
        }

        try {
            // El formulario ya tiene todos los datos de 'state' más los datos de trabajador
            await apiFetch("/api/personas/registrar", {
                method: 'POST',
                body: form, 
            });

            setOk("Trabajador registrado correctamente.");
            navigate("/login");
        } catch (err) {
            const apiErr = err.message || "Error al registrar el trabajador.";
            setError(apiErr);
        }
    }, [form, navigate]);

    return {
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
        shouldRender: true,
    };
};

export default useRegistroTrabajador;