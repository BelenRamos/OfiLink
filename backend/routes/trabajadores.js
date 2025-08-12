const express = require('express');
const router = express.Router();
const {
  filtrarTrabajadores,
  obtenerTrabajadorPorId,
} = require('../controllers/trabajadoresController');

router.get('/', filtrarTrabajadores);
router.get('/:id', obtenerTrabajadorPorId); 


module.exports = router;
