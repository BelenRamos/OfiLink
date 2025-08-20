const express = require('express');
const router = express.Router();
const { getContrataciones, createContratacion} = require('../controllers/contratacionesController');

router.get('/', getContrataciones);
router.post('/', createContratacion);

module.exports = router;