const express = require('express');
const router = express.Router();
// Importa TODAS las funciones del controlador que creamos en la solución anterior.
const { 
    getRoles, 
    createRol, 
    updateRol,       // <--- Faltante
    deleteRol,       // <--- Faltante
    getRolesConPermisos,
    getPermisosPorRol, // <--- Faltante
    asignarPermisosARol // <--- Faltante
} = require('../../controllers/rolesController'); 

// --- Rutas de Gestión de Roles (CRUD) ---
// GET /api/roles
router.get('/', getRoles);
// POST /api/roles
router.post('/', createRol);
// PUT /api/roles/:id (Edición del nombre)
router.put('/:id', updateRol);       // <--- NECESARIO para la edición
// DELETE /api/roles/:id (Eliminación)
router.delete('/:id', deleteRol);    // <--- NECESARIO para la eliminación

// --- Rutas de Gestión de Permisos por Rol ---
// GET /api/roles/con-permisos (Visualización de árbol por rol - ya existía)
router.get('/con-permisos', getRolesConPermisos);

// GET /api/roles/:id/permisos (Obtener permisos asignados para el modal)
router.get('/:id/permisos', getPermisosPorRol);  // <--- NECESARIO para el modal (fetch)
// POST /api/roles/:id/permisos (Guardar los permisos asignados desde el modal)
router.post('/:id/permisos', asignarPermisosARol); // <--- NECESARIO para guardar permisos

module.exports = router;