const express = require('express');
const router = express.Router();
const autenticarJWT = require('../middleware/auth');
const { login, cambiarPassword, logout, obtenerSessionLogs} = require('../controllers/authController');

router.post('/login', login);
router.post('/cambiarPassword', cambiarPassword);
router.post('/logout', autenticarJWT, logout);
router.get("/sessionLogs", obtenerSessionLogs);

module.exports = router;