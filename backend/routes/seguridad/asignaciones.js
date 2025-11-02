const express = require('express');
const router = express.Router();
const { getPersonasConGrupo, getGruposDisponibles, asignarGrupoAPersona } = require('../../controllers/asignacionesController');
const { autenticarJWT } = require('../../middleware/auth'); // Mantenemos la función de permisos

// GET /api/asignaciones/personas (Obtiene todas las personas con su grupo)
router.get('/personas',autenticarJWT, getPersonasConGrupo); 

// GET /api/asignaciones/grupos (Obtiene la lista de grupos para el selector)
router.get('/grupos', autenticarJWT, getGruposDisponibles);

// POST /api/asignaciones/asignar (Asigna o actualiza el GrupoId de una persona)
router.post('/asignar', autenticarJWT, asignarGrupoAPersona);

module.exports = router;