const express = require('express');
const router = express.Router();
const { autenticarJWT } = require('../middleware/auth'); 
const {
  filtrarTrabajadores,
  obtenerTrabajadorPorId,
  actualizarDisponibilidad,
  actualizarTrabajador,
} = require('../controllers/trabajadoresController');

router.get('/', filtrarTrabajadores);
router.get('/:id', obtenerTrabajadorPorId); 
router.put('/:id/disponibilidad', autenticarJWT, actualizarDisponibilidad);
router.put('/:id', autenticarJWT, actualizarTrabajador);

module.exports = router;