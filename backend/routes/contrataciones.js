const express = require('express');
const router = express.Router();
const { autenticarJWT } = require('../middleware/auth'); 
const {
  getContrataciones,
  createContratacion,
  manejarAccionContratacion,
} = require('../controllers/contratacionesController');

// Usar el middleware de autenticación JWT en todas las rutas de contrataciones
// El router.use() aplica el middleware a TODAS las rutas definidas después de él.
router.use(autenticarJWT);

// GET /contrataciones: Obtener contrataciones del usuario autenticado
router.get('/', getContrataciones); 

// POST /contrataciones: Crear una nueva contratación
router.post('/', createContratacion); 

// PUT /contrataciones/:id/:accion: Manejar acciones (ej. aceptar, rechazar, finalizar)
router.put('/:id/:accion', manejarAccionContratacion);

module.exports = router;