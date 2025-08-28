import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import MenuIngreso from './pages/MenuIngreso';
import Buscar from './pages/Buscar';
import Login from './pages/Login';
import Registro from './pages/Registro';
import PerfilTrabajador from './pages/PerfilTrabajador';
import MiPerfil from './pages/MiPerfil';
import DashboardLayout from './pages/admin/DashboardLayout';
import Home from './pages/Home'; // Página interna con resumen
import PrivateRoute from './components/PrivateRoute';
import FormularioRegistro from './pages/FormularioRegistro';
import FormularioTrabajador from './pages/FormularioTrabajador';

function App() {
  const usuario = JSON.parse(localStorage.getItem('usuarioActual'));

  return (
    <Router>
      {/* Navbar solo si hay usuario logueado */}
      <Navbar key={localStorage.getItem('usuarioActual') ? 'log' : 'nolog'} />

      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<MenuIngreso />} />
        <Route path="/login" element={<Login />} />
        <Route path="/formularioRegistro" element={<FormularioRegistro />} />
        <Route path="/formularioTrabajador" element={<FormularioTrabajador />} />
        <Route path="/perfil/:id" element={<PerfilTrabajador />} />

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
        <Route path="/admin/*" element={
          <PrivateRoute allowedRoles={['administrador', 'supervisor']}>
            <DashboardLayout />
          </PrivateRoute>
        } />

      </Routes>
    </Router>
  );
}

export default App;
