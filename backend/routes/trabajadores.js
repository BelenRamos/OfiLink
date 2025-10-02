const express = require('express');
const router = express.Router();
const {
  filtrarTrabajadores,
  obtenerTrabajadorPorId,
  actualizarDisponibilidad,
} = require('../controllers/trabajadoresController');

router.get('/', filtrarTrabajadores);
router.get('/:id', obtenerTrabajadorPorId); 
router.put('/:id/disponibilidad', actualizarDisponibilidad);


module.exports = router;
