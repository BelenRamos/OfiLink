const express = require('express');
const router = express.Router();
const { obtenerResenasPorTrabajador, crearResena } = require('../controllers/resenasController');

router.get('/trabajador/:id', obtenerResenasPorTrabajador);
router.post('/', crearResena);

module.exports = router;



