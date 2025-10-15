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
router.get('/', getOficios);

// POST /api/oficios
// Agrega un nuevo oficio
router.post('/', createOficio);

// PUT /api/oficios/:id
// Edita un oficio existente (se pasa el ID como parámetro de ruta)
router.put('/:id', updateOficio);

// DELETE /api/oficios/:id
// Elimina un oficio (se pasa el ID como parámetro de ruta)
router.delete('/:id', deleteOficio);

module.exports = router;