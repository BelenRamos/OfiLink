const express = require('express');
const router = express.Router();
const {
  verificarToken,
  getSolicitudesCliente,
  getSolicitudesTrabajador,
  createSolicitud,
  cancelarSolicitud,
  tomarSolicitud,
} = require('../controllers/solicitudesController'); 

// Crear una nueva solicitud (Solo Cliente)
router.post('/', verificarToken, createSolicitud);
// Obtener solicitudes creadas por el usuario logueado (Solo Cliente)
router.get('/cliente', verificarToken, getSolicitudesCliente);
// Obtener solicitudes abiertas que coinciden con el perfil del trabajador (Solo Trabajador)
router.get('/disponibles', verificarToken, getSolicitudesTrabajador);
// Cancelar una solicitud (Cliente o Administrador/Supervisor)
router.put('/:id/cancelar', verificarToken, cancelarSolicitud);
// Un trabajador toma una solicitud disponible, lo que crea una contratación (Solo Trabajador)
router.put('/:id/tomar', verificarToken, tomarSolicitud);


module.exports = router;