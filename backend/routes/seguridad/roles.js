const express = require('express');
const router = express.Router();
const { getRoles, createRol, getRolesConPermisos } = require('../../controllers/rolesController');

router.get('/', getRoles);
router.post('/', createRol);
router.get('/con-permisos', getRolesConPermisos);

module.exports = router;


