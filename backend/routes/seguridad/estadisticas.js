const express = require('express');
const router = express.Router();
const {
  getResumenSolicitudesYContrataciones
} = require('../../controllers/estadisticasController');

// Ruta para obtener el resumen general (solicitudes y contrataciones)
router.get('/solicitudes-contrataciones', getResumenSolicitudesYContrataciones);

module.exports = router;
