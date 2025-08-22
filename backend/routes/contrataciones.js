const express = require('express');
const router = express.Router();
const {
  getContrataciones,
  createContratacion,
  manejarAccionContratacion,
  verificarToken
} = require('../controllers/contratacionesController');

// Usar el middleware de verificación de token en todas las rutas de contrataciones
router.use(verificarToken);

// Obtener todas las contrataciones del usuario
router.get('/', getContrataciones);

// Crear una nueva contratación
router.post('/', createContratacion);

// Manejar todas las acciones de la contratación (aceptar, terminar, cancelar)
router.put('/:id/:accion', manejarAccionContratacion);

module.exports = router;