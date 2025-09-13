const express = require('express');
const router = express.Router();
const { getResumenPersonas, 
        getPersonasReporte,
        registrarPersona,
        getPersonas,
        resetPassword} = require('../controllers/personasController');

router.get('/resumen', getResumenPersonas);
router.get('/reporte', getPersonasReporte);
router.post('/registrar', registrarPersona);
router.get('/', getPersonas);
router.post('/:id/reset-password', resetPassword);


module.exports = router;
