const express = require('express');
const router = express.Router();
const { getPermisos, createPermiso } = require('../../controllers/permisosController');
const { autenticarJWT, requirePermission } = require('../../middleware/auth'); 

const PERMISO_GESTIONAR = 'gestionar_permisos';

router.get( '/', autenticarJWT, requirePermission(PERMISO_GESTIONAR), getPermisos);
router.post('/', autenticarJWT, requirePermission(PERMISO_GESTIONAR), createPermiso);

module.exports = router;