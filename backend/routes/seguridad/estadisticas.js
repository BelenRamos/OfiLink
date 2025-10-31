const { autenticarJWT, requirePermission } = require('../../middleware/auth');
const express = require('express');
const router = express.Router();
const {
  getResumenSolicitudesYContrataciones
} = require('../../controllers/estadisticasController');

const PERMISO_REQUERIDO = 'ver_dashboard';

router.get(
    '/solicitudes-contrataciones', 
    autenticarJWT, 
    requirePermission(PERMISO_REQUERIDO), 
    getResumenSolicitudesYContrataciones
);

module.exports = router;