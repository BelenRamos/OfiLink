const express = require('express');
const router = express.Router();
const { getOficios } = require('../controllers/oficiosController');

router.get('/', getOficios);

module.exports = router;
