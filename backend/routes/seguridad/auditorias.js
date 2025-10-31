const express = require('express');
const router = express.Router();
const { getHistorialAuditoria } = require('../../controllers/auditoriasController');
const { autenticarJWT, requirePermission } = require('../../middleware/auth'); 

router.get('/', autenticarJWT, requirePermission('ver_auditoria'), getHistorialAuditoria);

module.exports = router;
