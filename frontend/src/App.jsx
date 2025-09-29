import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

//Pages y components
import Navbar from './components/Navbar';
import MenuIngreso from './pages/MenuIngreso';
import Buscar from './pages/Buscar';
import Login from './pages/Login';
import PerfilTrabajador from './pages/PerfilTrabajador';
import MiPerfil from './pages/MiPerfil';
import DashboardLayout from './pages/admin/DashboardLayout';
import Home from './pages/Home'; 
import PrivateRoute from './components/PrivateRoute';
import FormularioRegistro from './pages/FormularioRegistro';
import FormularioTrabajador from './pages/FormularioTrabajador';
import CambiarPassword from './pages/CambiarPassword';
import MisContrataciones from './pages/MisContrataciones';
import MisSolicitudes from './pages/MisSolicitudes';
import SolicitudesClientes from './pages/SolicitudesClientes';

function App() {
  //const usuario = JSON.parse(localStorage.getItem('usuarioActual'));

  return (
    <Router>
      {/* Navbar solo si hay usuario logueado */}
      {/* <Navbar key={localStorage.getItem('usuarioActual') ? 'log' : 'nolog'} /> */} {/* El Navbar ahora debe usar el hook 'useAuth' internamente.*/}
      <Navbar /> 
      

      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<MenuIngreso />} />
        <Route path="/login" element={<Login />} />
        <Route path="/formularioRegistro" element={<FormularioRegistro />} />
        <Route path="/formularioTrabajador" element={<FormularioTrabajador />} />
        <Route path="/perfil/:id" element={<PerfilTrabajador />} />
        <Route path="/cambiarPassword" element={<CambiarPassword />} />


        {/* Rutas privadas */}
        <Route path="/home" element={
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        } />
        <Route path="/buscar" element={
          <PrivateRoute>
            <Buscar />
          </PrivateRoute>
        } />
        <Route path="/mi-perfil" element={
          <PrivateRoute>
            <MiPerfil />
          </PrivateRoute>
        } />
        <Route path="/mis-contrataciones" element={
          <PrivateRoute>
            <MisContrataciones />
          </PrivateRoute>
        } />
        <Route path="/admin/*" element={
          <PrivateRoute allowedRoles={['administrador', 'supervisor']}>
            <DashboardLayout />
          </PrivateRoute>
        } />
        <Route path="/mis-solicitudes" element={
          <PrivateRoute>
            <MisSolicitudes />
          </PrivateRoute>
        } />
        <Route path="/solicitudes-clientes" element={
          <PrivateRoute>
            <SolicitudesClientes />
          </PrivateRoute>
        } />

      </Routes>
    </Router>
  );
}

export default App;
