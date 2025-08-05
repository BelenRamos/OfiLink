import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Navbar from './components/Navbar';
import Home from './pages/Home'; // landing page
import Buscar from './pages/Buscar';
import Login from './pages/Login';
import Registro from './pages/Registro';
import PerfilTrabajador from './pages/PerfilTrabajador';
import MiPerfil from './pages/MiPerfil';
import DashboardLayout from './pages/admin/DashboardLayout';

import PrivateRoute from './components/PrivateRoute';

function App() {
  const usuario = JSON.parse(localStorage.getItem('usuarioActual'));

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/buscar" element={<Buscar />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/perfil/:id" element={<PerfilTrabajador />} />

        {/* Solo logueados pueden ver "mi-perfil" */}
        <Route path="/mi-perfil" element={
          <PrivateRoute>
            <MiPerfil />
          </PrivateRoute>
        } />

        {/* Solo admin o supervisor pueden ver "/admin" */}
        <Route path="/admin/*" element={
          <PrivateRoute allowedRoles={['admin', 'supervisor']}>
            <DashboardLayout />
          </PrivateRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
