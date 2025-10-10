const express = require('express');
const router = express.Router();
const { 
    getPersonasReporte,
    registrarPersona,
    actualizarPersona,
    getResumenPersonas,
    getPersonas,
    resetPassword,
    subirFoto,
    uploadMiddleware,
    getPersonaPorId,
    modificarEstadoCuenta,
} = require('../controllers/personasController');

const { autenticarJWT, isAdmin } = require('../middleware/auth'); 

router.get('/resumen', getResumenPersonas);
router.put('/:id/foto', uploadMiddleware, subirFoto);
router.get('/reporte', getPersonasReporte);
router.post('/registrar', registrarPersona);
router.get('/', getPersonas);
router.put('/:id/reset-password', resetPassword); 
router.get('/:id', getPersonaPorId);
router.put('/:id', actualizarPersona);
router.put('/:id/estado', autenticarJWT, isAdmin, modificarEstadoCuenta);


module.exports = router;