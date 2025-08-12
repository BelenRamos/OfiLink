// routes/permisos.js
const express = require('express');
const router = express.Router();
const { getPermisos, createPermiso } = require('../../controllers/permisosController');

router.get('/', getPermisos);
router.post('/', createPermiso);

module.exports = router;
