import { createContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode"; 
import { tienePermiso as checkPermiso } from "../utils/permisos";
import { tieneRol as checkRol } from "../utils/roles";

export const AuthContext = createContext();

// Lógica para decodificar y establecer el usuario (sin cambios, es correcta)
const processAndSetUsuario = (usuarioData, setUsuario) => {
    if (!usuarioData?.token) {
        setUsuario(null);
        return;
    }

    try {
        const decodedToken = jwtDecode(usuarioData.token);
        
        const currentTime = Date.now() / 1000;
        if (decodedToken.exp < currentTime) {
            localStorage.removeItem("usuarioActual");
            setUsuario(null);
            return;
        }

        const usuarioFinal = {
            ...usuarioData,
            roles_keys: decodedToken.roles_keys || [],
            permisos_keys: decodedToken.permisos_keys || [],
        };
        setUsuario(usuarioFinal);

    } catch (err) {
        console.error("Error al decodificar token:", err);
        localStorage.removeItem("usuarioActual");
        setUsuario(null);
    }
};


export const AuthProvider = ({ children }) => {
    const [usuario, setUsuario] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const logoutUser = async () => {
        const token = usuario?.token; 
        
        // 1. Llamada al Backend para registrar el cierre
        if (token) {
            try {
                // Usamos fetch directo para evitar problemas con interceptores
                await fetch('/api/auth/logout', { 
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
            } catch (err) {
                // El logout debe ser robusto. Si falla el backend, limpiamos el frontend igual.
                console.error('Error registrando logout en backend:', err);
            }
        }
        
        // 2. Limpieza del estado local
        localStorage.removeItem("usuarioActual");
        setUsuario(null);
    };


    const loginUser = (usuarioData) => {
        localStorage.setItem("usuarioActual", JSON.stringify(usuarioData));
        processAndSetUsuario(usuarioData, setUsuario);
    };
    
    useEffect(() => {
        const cargarUsuarioInicial = () => {
            const usuarioGuardado = localStorage.getItem("usuarioActual");
            if (usuarioGuardado) {
                try {
                    const parsedUsuario = JSON.parse(usuarioGuardado);
                    processAndSetUsuario(parsedUsuario, setUsuario);
                } catch (err) {
                    console.error("Error al cargar usuario de localStorage:", err);
                    localStorage.removeItem("usuarioActual");
                }
            }
            setIsLoading(false);
        };

        cargarUsuarioInicial();
    }, []);

    const tienePermiso = (permiso) => checkPermiso(usuario, permiso);

    // AÑADE ESTE CONSOLE.LOG AQUÍ:
    useEffect(() => {
        if (usuario) {
            console.log("Contexto: Usuario cargado. Permisos:", usuario.permisos_keys);
            console.log("Contexto: ¿Tiene 'contratacion_terminar'?", tienePermiso('contratacion_terminar'));
        }
    }, [usuario]);

    const tieneRol = (...roles) => checkRol(usuario, ...roles);

    return (
        <AuthContext.Provider
            value={{ usuario, loginUser, logoutUser, tienePermiso, tieneRol, isLoading }}
        >
            {children}
        </AuthContext.Provider>
    );
};