const express = require('express');
const router = express.Router();
const { getResumenPersonas, getPersonasReporte } = require('../controllers/personasController');

router.get('/resumen', getResumenPersonas);
router.get('/reporte', getPersonasReporte);

module.exports = router;
