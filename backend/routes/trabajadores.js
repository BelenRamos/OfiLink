const express = require('express');
const router = express.Router();
const {
  filtrarTrabajadores,
  obtenerTrabajadorPorId,
  actualizarDisponibilidad,
  actualizarTrabajador,
} = require('../controllers/trabajadoresController');

router.get('/', filtrarTrabajadores);
router.get('/:id', obtenerTrabajadorPorId); 
router.put('/:id/disponibilidad', actualizarDisponibilidad);
router.put('/:id', actualizarTrabajador);

module.exports = router;
