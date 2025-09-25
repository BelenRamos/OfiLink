import React from 'react'; // Ya no necesitamos { useEffect, useState }
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/logo1.png';
import './Navbar.css';
import { useAuth } from '../hooks/useAuth'; // 🔑 Importamos el hook

const Navbar = () => {
    const { usuario, tieneRol, logoutUser } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        // La función logoutUser es asíncrona y espera el fetch al backend.
        await logoutUser(); 
        
        // Una vez que el estado está limpio, navegamos.
        navigate('/login');
    };

    // Función tieneRol del contexto directamente
    const esAdminOSupervisor = usuario && tieneRol('administrador', 'supervisor');

    return (
        <nav className="navbar navbar-expand-lg navbar-custom px-4 navbar-reducido">
            {esAdminOSupervisor ? (
                <span className="navbar-brand d-flex align-items-center">
                    <img src={logo} alt="OfiLink logo" className="logo-img" />
                </span>
            ) : (
                <Link 
                    className="navbar-brand d-flex align-items-center" 
                    // Si el usuario existe, va a /home, si no, a /
                    to={usuario ? "/home" : "/"} 
                >
                    <img src={logo} alt="OfiLink logo" className="logo-img" />
                </Link>
            )}

            <div className="collapse navbar-collapse">
                <ul className="navbar-nav ms-auto">
                    {/* El Navbar reacciona a 'usuario' del contexto. */}
                    {usuario ? (
                        <>
                            {/* Los chequeos de rol ahora usan la función del contexto */}
                            {tieneRol('cliente') && (
                                <>
                                    <li className="nav-item"><Link className="nav-link" to="/buscar">Buscar</Link></li>
                                    <li className="nav-item"><Link className="nav-link" to="/mi-perfil">Mi perfil</Link></li>
                                    <li className="nav-item"><Link className="nav-link" to="/mis-contrataciones">Mis Contrataciones</Link></li>
                                </>
                            )}

                            {tieneRol('trabajador') && (
                                <li className="nav-item"><Link className="nav-link" to="/mi-perfil">Mi perfil</Link></li>
                            )}

                            <li className="nav-item">
                                {/* Llama a la función simplificada handleLogout */}
                                <button className="nav-link btn btn-link logout-btn" onClick={handleLogout}>
                                    Cerrar sesión
                                </button>
                            </li>
                        </>
                    ) : null}
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;