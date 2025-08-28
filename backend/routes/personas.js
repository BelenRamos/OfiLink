const express = require('express');
const router = express.Router();
const { getResumenPersonas, 
        getPersonasReporte,
        registrarPersona} = require('../controllers/personasController');

router.get('/resumen', getResumenPersonas);
router.get('/reporte', getPersonasReporte);
router.post('/registrar', registrarPersona);

module.exports = router;
