const express = require('express');
const router = express.Router();
const { autenticarJWT, requirePermission } = require('../middleware/auth');
const { obtenerResenasPorTrabajador, crearResena } = require('../controllers/resenasController');

const PERMISO_RESENAR = 'contratacion_resenar';

router.get('/trabajador/:id', obtenerResenasPorTrabajador);
router.post('/', autenticarJWT, requirePermission(PERMISO_RESENAR), crearResena); 

module.exports = router;