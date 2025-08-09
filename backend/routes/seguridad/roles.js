const express = require('express');
const router = express.Router();
const { getRoles, createRol } = require('../../controllers/rolesController');

router.get('/', getRoles);
router.post('/', createRol);

module.exports = router;


