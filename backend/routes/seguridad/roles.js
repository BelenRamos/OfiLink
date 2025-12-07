const express = require('express');
const router = express.Router();
const { 
    getRoles, 
    createRol, 
    updateRol, 
    deleteRol, 
    getRolesConPermisos,
    getPermisosPorRol,
    asignarPermisosARol 
} = require('../../controllers/rolesController'); 

const { autenticarJWT, requirePermission } = require('../../middleware/auth'); 

// Middleware de permiso centralizado
const requiereGestionRoles = [
    autenticarJWT, 
    requirePermission('gestionar_roles') // Todas requieren el permiso 'gestionar_roles'
];

// --- Rutas de Gestión de Roles (CRUD) ---
router.get('/', requiereGestionRoles, getRoles);
router.post('/', requiereGestionRoles, createRol);
router.put('/:id', requiereGestionRoles, updateRol);
router.delete('/:id', requiereGestionRoles, deleteRol); 

// --- Rutas de Gestión de Permisos por Rol ---
router.get('/con-permisos', requiereGestionRoles, getRolesConPermisos);
router.get('/:id/permisos', requiereGestionRoles, getPermisosPorRol); 
router.post('/:id/permisos', requiereGestionRoles, asignarPermisosARol); 

module.exports = router;