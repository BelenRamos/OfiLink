const express = require('express');
const router = express.Router();
const { autenticarJWT, requirePermission } = require('../../middleware/auth'); 
const {
  getGrupos,
  createGrupo,
  updateGrupo, 
  deleteGrupo,
  getRolesPorGrupo,
  asignarRolesAGrupo
} = require('../../controllers/gruposController');

const PERMISO_GESTIONAR = 'gestionar_grupos';


// GET /api/grupos
router.get('/', autenticarJWT, requirePermission(PERMISO_GESTIONAR), getGrupos);

// POST /api/grupos
router.post('/', autenticarJWT, requirePermission(PERMISO_GESTIONAR), createGrupo);

// PUT /api/grupos/:id
router.put('/:id', autenticarJWT, requirePermission(PERMISO_GESTIONAR), updateGrupo);

// DELETE /api/grupos/:id
router.delete('/:id', autenticarJWT, requirePermission(PERMISO_GESTIONAR), deleteGrupo);

// GET /api/grupos/:id/roles
router.get('/:id/roles', autenticarJWT, requirePermission(PERMISO_GESTIONAR), getRolesPorGrupo);

// PUT /api/grupos/:id/roles
router.put('/:id/roles', autenticarJWT, requirePermission(PERMISO_GESTIONAR), asignarRolesAGrupo);

module.exports = router;
