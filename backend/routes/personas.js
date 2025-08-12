const express = require('express');
const router = express.Router();
const { getResumenPersonas } = require('../controllers/personasController');

router.get('/resumen', getResumenPersonas);

module.exports = router;
