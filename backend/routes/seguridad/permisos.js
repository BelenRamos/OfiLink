const express = require('express');
const router = express.Router();
const {  getPermisos, createPermiso, updatePermiso, deletePermiso } = require('../../controllers/permisosController');
const { autenticarJWT, requirePermission } = require('../../middleware/auth'); 


const PERMISO_GESTIONAR = 'gestionar_permisos';

// GET /api/permisos
router.get('/', autenticarJWT, requirePermission(PERMISO_GESTIONAR), getPermisos);

// POST /api/permisos
router.post('/', autenticarJWT, requirePermission(PERMISO_GESTIONAR), createPermiso);

// PUT /api/permisos/:id
router.put('/:id', autenticarJWT, requirePermission(PERMISO_GESTIONAR), updatePermiso);

// DELETE /api/permisos/:id
router.delete('/:id', autenticarJWT, requirePermission(PERMISO_GESTIONAR), deletePermiso);

module.exports = router;



