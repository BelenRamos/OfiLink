import React from 'react';
//import { Router } from 'react-router-dom';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Buscar from './pages/Buscar';
import Login from './pages/Login';
import Registro from './pages/Registro';
import PerfilTrabajador from './pages/PerfilTrabajador';
import MiPerfil from './pages/MiPerfil';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/buscar" element={<Buscar />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/perfil/:id" element={<PerfilTrabajador />} />
        <Route path="/mi-perfil" element={<MiPerfil />} />
      </Routes>
    </Router>
  );
}

export default App;
