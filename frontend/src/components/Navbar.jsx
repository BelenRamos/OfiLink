import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/logo1.png';
import './Navbar.css';
import { useAuth } from '../hooks/useAuth'; 

const Navbar = () => {
    const { usuario, tieneRol, logoutUser } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logoutUser(); 
        navigate('/login');
    };

    //Define si tiene permisos de Admin/Supervisor (que priorizan la vista)
    const esAdminOSupervisor = usuario && tieneRol('administrador', 'supervisor');

    //Define los roles que deben ver la Interfaz de Usuario Final (UI)
    const esUsuarioFinalUI = tieneRol('cliente', 'trabajador', 'visitor');
    
    //Modos de Navegación
    const modoAdmin = esAdminOSupervisor;
    const modoUsuarioFinal = usuario && !modoAdmin && esUsuarioFinalUI;


    return (
        <nav className="navbar navbar-expand-lg navbar-custom px-4 navbar-reducido">
            {modoAdmin ? ( 
                <span className="navbar-brand d-flex align-items-center">
                    <img src={logo} alt="OfiLink logo" className="logo-img" />
                </span>
            ) : (
                <Link 
                    className="navbar-brand d-flex align-items-center" 
                    to={usuario ? "/home" : "/"} 
                >
                    <img src={logo} alt="OfiLink logo" className="logo-img" />
                </Link>
            )}

            <div className="collapse navbar-collapse" id="navbarNav">
                <ul className="navbar-nav ms-auto">
                    
                    {/* ENLACES DE ADMINISTRACIÓN */}
                    {modoAdmin && (
                        <li className="nav-item"><Link className="nav-link" to="/mi-perfil">Configuracion de perfil</Link></li>
                    )}
                    
                    {/* ENLACES PARA INTERFAZ DE USUARIO FINAL */}
                    {modoUsuarioFinal && (
                        <>
                            {/* ENLACES DE CLIENTE: Visibles para CLINETE O VISITOR */}
                            {tieneRol('cliente') || tieneRol('visitor') ? (
                                <>
                                    <li className="nav-item"><Link className="nav-link" to="/buscar">Buscar</Link></li>
                                    <li className="nav-item"><Link className="nav-link" to="/mis-solicitudes">Mis Solicitudes</Link></li>
                                    <li className="nav-item"><Link className="nav-link" to="/mis-contrataciones">Mis Contrataciones</Link></li>
                                </>
                            ) : null}

                            {/* ENLACES DE TRABAJADOR: Visibles para TRABAJADOR O VISITOR */}
                            {tieneRol('trabajador') || tieneRol('visitor') ? (
                                <li className="nav-item"><Link className="nav-link" to="/solicitudes-clientes">Trabajos Disponibles</Link></li>
                            ) : null}
                            
                            {/* Enlace de Perfil (Común a todos en la UI) */}
                            <li className="nav-item"><Link className="nav-link" to="/mi-perfil">Mi perfil</Link></li>
                        </>
                    )}
                    
                    {/* CERRAR SESIÓN*/}
                    {usuario && (
                        <li className="nav-item">
                            <button className="nav-link btn btn-link logout-btn" onClick={handleLogout}>
                                Cerrar sesión
                            </button>
                        </li>
                    )}
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;