const express = require('express');
const router = express.Router();
const { autenticarJWT, requirePermission } = require('../middleware/auth'); 
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
    eliminarCuentaLogica,
    } = require('../controllers/personasController');

const PERMISO_RESETEAR_PASS = 'resetear_pass';
const PERMISO_BLOQUEAR = 'bloquear_usuario';
const PERMISO_ELIMINAR = 'eliminar_usuario';
const PERMISO_REPORTE = 'ver_reporte';
const PERMISO_VER_RESUMEN = 'ver_dashboard'; 

// --- RUTAS DE ACCESO PÚBLICO O INTERNO ---
router.post('/registrar', registrarPersona);
router.get('/resumen', autenticarJWT, requirePermission(PERMISO_VER_RESUMEN), getResumenPersonas);
router.get('/reporte', autenticarJWT, requirePermission(PERMISO_REPORTE), getPersonasReporte);

// --- RUTAS DE GESTIÓN (ID en parámetro o mi-perfil) ---
router.put('/mi-perfil/eliminar', autenticarJWT, eliminarCuentaLogica); 
router.put('/:id/foto', uploadMiddleware, subirFoto);
router.get('/:id', autenticarJWT, getPersonaPorId);
router.get('/', autenticarJWT, getPersonas); 
router.put('/:id', autenticarJWT, actualizarPersona); 
router.put('/:id/reset-password', autenticarJWT, requirePermission(PERMISO_RESETEAR_PASS), resetPassword); 
router.put('/:id/estado', autenticarJWT, requirePermission(PERMISO_BLOQUEAR), modificarEstadoCuenta); //(BLOQUEAR/ACTIVAR)
router.put('/:id/eliminar', autenticarJWT, requirePermission(PERMISO_ELIMINAR), eliminarCuentaLogica); 


module.exports = router;