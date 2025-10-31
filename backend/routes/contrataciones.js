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

router.get('/', getContrataciones); 

router.post('/', createContratacion); 

router.put('/:id/:accion', manejarAccionContratacion);

module.exports = router;

//No hay permisos para cada ruta