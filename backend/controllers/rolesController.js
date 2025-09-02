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

module.exports = {
  getRoles,
  createRol,
  getRolesConPermisos
};
