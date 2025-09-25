import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

/**
 * Hook para acceder al AuthContext
 *  @returns { usuario, setUsuario, tienePermiso, tieneRol, isLoading }
 */
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }

  return context;
};