const express = require('express');
const router = express.Router();
const { getGrupos, createGrupo, getRolesPorGrupo, asignarRolesAGrupo } = require('../../controllers/gruposController');

router.get('/', getGrupos);
router.post('/', createGrupo);
router.get('/:id/roles', getRolesPorGrupo);     // Mapea a getRolesPorGrupo
router.post('/:id/roles', asignarRolesAGrupo);  // Mapea a asignarRolesAGrupo


module.exports = router;
