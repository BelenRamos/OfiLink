const express = require('express');
const router = express.Router();
// Importamos todas las funciones del controlador
const { 
    getOficios, 
    createOficio, 
    updateOficio, 
    deleteOficio 
} = require('../controllers/oficiosController');

// --- RUTAS DE GESTIÓN DE OFICIOS ---

// GET /api/oficios
// Obtiene todos los oficios
router.get('/', getOficios); //Permiso: ver_oficios

// POST /api/oficios
// Agrega un nuevo oficio
router.post('/', createOficio); //Permiso: crear_oficio

// PUT /api/oficios/:id
// Edita un oficio existente (se pasa el ID como parámetro de ruta)
router.put('/:id', updateOficio); // Permiso: editar_oficio

// DELETE /api/oficios/:id
// Elimina un oficio (se pasa el ID como parámetro de ruta)
router.delete('/:id', deleteOficio); //Permiso: eliminar_oficio

module.exports = router;

