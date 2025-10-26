const { poolPromise, sql } = require('../db');

const getRoles = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT Id, Nombre FROM Rol ORDER BY Nombre
    `);
    res.json(result.recordset);
  } catch (error) {
    console.error('Error al obtener roles:', error);
    res.status(500).json({ error: 'Error al obtener los roles' });
  }
};

const createRol = async (req, res) => {
  const { nombre } = req.body;
  if (!nombre) {
    return res.status(400).json({ error: 'El nombre es obligatorio' });
  }

  try {
    const pool = await poolPromise;
    await pool.request()
      .input('nombre', sql.NVarChar(100), nombre)
      .query(`INSERT INTO Rol (Nombre) VALUES (@nombre)`);

    res.status(201).json({ message: 'Rol creado correctamente' });
  } catch (error) {
    console.error('Error al crear rol:', error);
    if (error.originalError?.info?.number === 2627) {
      return res.status(400).json({ error: 'El nombre del rol ya existe' });
    }
    res.status(500).json({ error: 'Error al crear el rol' });
  }
};

//Jerarquia de permisos y roles
const getRolesConPermisos = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      WITH PermisosJerarquia AS (
        SELECT 
          p.Id,
          p.Nombre,
          p.Descripcion,
          p.PadreId,
          CAST(p.Nombre AS NVARCHAR(MAX)) AS RutaJerarquia,
          0 AS Nivel
        FROM Permiso p
        WHERE p.PadreId IS NULL

        UNION ALL

        SELECT 
          c.Id,
          c.Nombre,
          c.Descripcion,
          c.PadreId,
          CAST(pj.RutaJerarquia + ' > ' + c.Nombre AS NVARCHAR(MAX)),
          pj.Nivel + 1
        FROM Permiso c
        INNER JOIN PermisosJerarquia pj ON c.PadreId = pj.Id
      )

      SELECT 
        r.Id AS RolId,
        r.Nombre AS RolNombre,
        pj.Id AS PermisoId,
        pj.Nombre AS PermisoNombre,
        pj.Descripcion,
        pj.PadreId,
        pj.Nivel,
        pj.RutaJerarquia
      FROM Rol r
      LEFT JOIN Rol_Permiso rp ON r.Id = rp.RolId
      LEFT JOIN PermisosJerarquia pj ON rp.PermisoId = pj.Id
      ORDER BY r.Nombre, pj.RutaJerarquia;
    `);

    // Estructura árbol por rol
    res.json(result.recordset);
  } catch (error) {
    console.error('Error al obtener roles con permisos:', error);
    res.status(500).json({ error: 'Error al obtener roles con permisos' });
  }
};

// --- Nuevos Módulos para CRUD y Permisos ---

// 1. UPDATE Rol (Editar Nombre)
const updateRol = async (req, res) => {
    const { id } = req.params;
    const { nombre } = req.body;
    if (!nombre) {
        return res.status(400).json({ error: 'El nombre es obligatorio' });
    }

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, id)
            .input('nombre', sql.NVarChar(100), nombre)
            .query(`UPDATE Rol SET Nombre = @nombre WHERE Id = @id`);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: 'Rol no encontrado' });
        }

        res.json({ message: 'Rol actualizado correctamente' });
    } catch (error) {
        console.error('Error al actualizar rol:', error);
        if (error.originalError?.info?.number === 2627) {
            return res.status(400).json({ error: 'El nombre del rol ya existe' });
        }
        res.status(500).json({ error: 'Error al actualizar el rol' });
    }
};

// 2. DELETE Rol (Eliminar)
const deleteRol = async (req, res) => {
    const { id } = req.params;

    try {
        const pool = await poolPromise;
        
        // Iniciar transacción para asegurar la integridad
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            // Eliminar dependencias de Rol_Permiso
            await transaction.request()
                .input('rolId', sql.Int, id)
                .query(`DELETE FROM Rol_Permiso WHERE RolId = @rolId`);

            // Eliminar dependencias de Grupo_Rol
            await transaction.request()
                .input('rolId', sql.Int, id)
                .query(`DELETE FROM Grupo_Rol WHERE RolId = @rolId`);

            // Eliminar el Rol
            const result = await transaction.request()
                .input('id', sql.Int, id)
                .query(`DELETE FROM Rol WHERE Id = @id`);

            if (result.rowsAffected[0] === 0) {
                await transaction.rollback();
                return res.status(404).json({ error: 'Rol no encontrado' });
            }

            await transaction.commit();
            res.json({ message: 'Rol eliminado correctamente' });
        } catch (error) {
            await transaction.rollback();
            throw error; // Re-lanza el error para que sea capturado por el catch externo
        }
    } catch (error) {
        console.error('Error al eliminar rol:', error);
        // Si el rol está referenciado en otra tabla (ej. error de FK no manejado), se notifica.
        res.status(500).json({ error: 'Error al eliminar el rol. Verifique que no esté en uso.' });
    }
};

// 3. GET Permisos por Rol (Para el Modal)
const getPermisosPorRol = async (req, res) => {
    const { id } = req.params;

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('rolId', sql.Int, id)
            .query(`
                SELECT 
                    RolId, 
                    PermisoId 
                FROM Rol_Permiso 
                WHERE RolId = @rolId
            `);
        res.json(result.recordset);
    } catch (error) {
        console.error('Error al obtener permisos del rol:', error);
        res.status(500).json({ error: 'Error al obtener permisos del rol' });
    }
};

// 4. POST/PUT Asignar Permisos a un Rol (Sobrescribe la asignación)
const asignarPermisosARol = async (req, res) => {
    const { id } = req.params;
    const { permisosIds } = req.body; // Array de IDs: [1, 5, 8]

    if (!Array.isArray(permisosIds)) {
        return res.status(400).json({ error: 'El listado de permisos es inválido' });
    }

    try {
        const pool = await poolPromise;
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            // 1. Eliminar todas las asignaciones existentes para este Rol
            await transaction.request()
                .input('rolId', sql.Int, id)
                .query(`DELETE FROM Rol_Permiso WHERE RolId = @rolId`);

            // 2. Insertar las nuevas asignaciones
            if (permisosIds.length > 0) {
                const request = transaction.request();
                const values = permisosIds.map((permisoId, index) => {
                    request.input(`rolId${index}`, sql.Int, id);
                    request.input(`permisoId${index}`, sql.Int, permisoId);
                    return `(@rolId${index}, @permisoId${index})`;
                }).join(', ');
                
                await request.query(`INSERT INTO Rol_Permiso (RolId, PermisoId) VALUES ${values}`);
            }

            await transaction.commit();
            res.status(200).json({ message: 'Permisos asignados correctamente' });
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    } catch (error) {
        console.error('Error al asignar permisos:', error);
        res.status(500).json({ error: 'Error al asignar permisos' });
    }
};

// 5. Nuevo GET para traer TODOS los permisos (para el árbol de asignación)
const getAllPermisos = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT Id, Nombre, Descripcion, PadreId FROM Permiso ORDER BY PadreId, Nombre
        `);
        res.json(result.recordset);
    } catch (error) {
        console.error('Error al obtener todos los permisos:', error);
        res.status(500).json({ error: 'Error al obtener los permisos' });
    }
};


module.exports = {
    getRoles,
    createRol,
    updateRol,       // <-- Nuevo
    deleteRol,       // <-- Nuevo
    getRolesConPermisos,
    getPermisosPorRol, // <-- Nuevo
    asignarPermisosARol, // <-- Nuevo
    getAllPermisos // <-- Nuevo (probablemente en otro archivo de Permisos, pero necesario)
};


