const express = require('express');
const router = express.Router();
const { login, cambiarPassword} = require('../controllers/authController');

router.post('/login', login);

router.post('/cambiarPassword', cambiarPassword);

module.exports = router;