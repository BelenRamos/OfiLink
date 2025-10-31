const express = require('express');
const router = express.Router();
const {
  verificarToken,
  crearDenuncia,
  obtenerDenuncias
} = require('../controllers/denunciasController');


router.post('/', verificarToken, crearDenuncia); //Permiso: denunciar_trabajador

router.get('/', obtenerDenuncias); //Permiso : ver_denuncias

module.exports = router;
