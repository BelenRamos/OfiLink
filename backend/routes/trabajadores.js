const express = require('express');
const router = express.Router();
const {
  filtrarTrabajadores,
  obtenerTrabajadorPorId, // 👈 AÑADIR
} = require('../controllers/trabajadoresController');

router.get('/', filtrarTrabajadores);
router.get('/:id', obtenerTrabajadorPorId); // 👈 NUEVA RUTA


module.exports = router;
