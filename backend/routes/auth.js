const express = require('express');
const router = express.Router();
const { autenticarJWT, requirePermission } = require('../middleware/auth'); 
const { login, cambiarPassword, logout, obtenerSessionLogs} = require('../controllers/authController');

const PERMISO_SESSION_LOGS = 'ver_sessionlogs';

//POST /login: NO requiere autenticación ni permisos
router.post('/login', login);
router.post('/cambiarPassword', cambiarPassword); 
router.post('/logout', autenticarJWT, logout);

router.get("/sessionLogs", autenticarJWT, requirePermission(PERMISO_SESSION_LOGS), obtenerSessionLogs);

module.exports = router;