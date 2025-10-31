const express = require('express');
const router = express.Router();
const { autenticarJWT, requirePermission } = require('../middleware/auth'); 
const { 
    getOficios, 
    createOficio, 
    updateOficio, 
    deleteOficio 
} = require('../controllers/oficiosController');

const PERMISO_CREAR = 'crear_oficio';
const PERMISO_EDITAR = 'editar_oficio';
const PERMISO_ELIMINAR = 'eliminar_oficio';

// GET /api/oficios: Obtiene todos los oficios (PÚBLICA - SIN AUTENTICACIÓN)
router.get('/', getOficios); 

// --- RUTAS DE GESTIÓN DE OFICIOS ---

router.post('/', autenticarJWT, requirePermission(PERMISO_CREAR), createOficio);

router.put('/:id', autenticarJWT, requirePermission(PERMISO_EDITAR), updateOficio);

router.delete('/:id', autenticarJWT, requirePermission(PERMISO_ELIMINAR), deleteOficio);

module.exports = router;