const express = require('express');
const router = express.Router();
const { autenticarJWT } = require('../middleware/auth'); 
const {
  getContrataciones,
  createContratacion,
  manejarAccionContratacion,
} = require('../controllers/contratacionesController');

router.use(autenticarJWT);

// GET /contrataciones: Obtener contrataciones del usuario autenticado
router.get('/', getContrataciones); 

// POST /contrataciones: Crear una nueva contratación
router.post('/', createContratacion); 

// PUT /contrataciones/:id/:accion: Manejar acciones (ej. aceptar, rechazar, finalizar)
router.put('/:id/:accion', manejarAccionContratacion);

module.exports = router;