const express = require('express');
const router = express.Router();
const { getZonas } = require('../controllers/zonasController');

router.get('/', getZonas);

module.exports = router;
