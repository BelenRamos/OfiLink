const express = require('express');
const router = express.Router();
const { getHistorialAuditoria } = require('../../controllers/auditoriasController');
const { autenticarJWT, isAdmin } = require('../../middleware/auth'); 

router.get('/', autenticarJWT, isAdmin, getHistorialAuditoria);

module.exports = router;
