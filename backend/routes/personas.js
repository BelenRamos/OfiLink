const express = require('express');
const router = express.Router();
const { 
    getPersonasReporte,
    registrarPersona,
    getResumenPersonas,
    getPersonas,
    resetPassword,
    subirFoto,
    uploadMiddleware,
    getPersonaPorId
} = require('../controllers/personasController');

router.get('/resumen', getResumenPersonas);
router.put('/:id/foto', uploadMiddleware, subirFoto);
router.get('/reporte', getPersonasReporte);
router.post('/registrar', registrarPersona);
router.get('/', getPersonas);
router.put('/:id/reset-password', resetPassword); 
router.get('/:id', getPersonaPorId);


module.exports = router;