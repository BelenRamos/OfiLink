const express = require('express');
const router = express.Router();
const { autenticarJWT, requirePermission } = require('../middleware/auth'); 
const {
  getSolicitudesCliente,
  getSolicitudesTrabajador,
  createSolicitud,
  cancelarSolicitud,
  tomarSolicitud,
} = require('../controllers/solicitudesController'); 

const PERMISO_CANCELAR = 'cancelar_solicitud';
const PERMISO_TOMAR = 'tomar_solicitud';

router.post('/', autenticarJWT, createSolicitud);
router.get('/cliente', autenticarJWT, getSolicitudesCliente);
router.get('/disponibles', autenticarJWT, getSolicitudesTrabajador);
router.put('/:id/cancelar', autenticarJWT, requirePermission(PERMISO_CANCELAR), cancelarSolicitud); 
router.put('/:id/tomar', autenticarJWT, requirePermission(PERMISO_TOMAR), tomarSolicitud); 


module.exports = router;