const express = require('express');
const router = express.Router();
const { autenticarJWT, requirePermission } = require('../middleware/auth');
const {
  crearDenuncia,
  obtenerDenuncias
} = require('../controllers/denunciasController');

const PERMISO_DENUNCIAR = 'denunciar_trabajador';
const PERMISO_VER = 'ver_denuncias';

router.post('/', autenticarJWT, requirePermission(PERMISO_DENUNCIAR), crearDenuncia); 

router.get('/', autenticarJWT, requirePermission(PERMISO_VER), obtenerDenuncias); 

module.exports = router;