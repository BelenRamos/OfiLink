const express = require('express');
const router = express.Router();
const {
  verificarToken,
  crearDenuncia,
  obtenerDenuncias
} = require('../controllers/denunciasController');


router.post('/', verificarToken, crearDenuncia);

router.get('/', obtenerDenuncias);

module.exports = router;
