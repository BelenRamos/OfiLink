// routes/grupos.js
const express = require('express');
const router = express.Router();
const { getGrupos, createGrupo } = require('../../controllers/gruposController');

router.get('/', getGrupos);
router.post('/', createGrupo);

module.exports = router;
