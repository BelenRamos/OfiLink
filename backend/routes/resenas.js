const express = require('express');
const router = express.Router();
const { obtenerResenasPorTrabajador } = require('../controllers/resenasController');

// GET /api/resenas/trabajador/:id
router.get('/trabajador/:id', obtenerResenasPorTrabajador);

module.exports = router;
