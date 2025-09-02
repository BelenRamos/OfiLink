const { poolPromise, sql } = require('../db');

const getPermisos = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .query(`
        SELECT Id, Nombre, Descripcion, PadreId 
        FROM Permiso
        ORDER BY Nombre
      `);
    res.json(result.recordset);
  } catch (error) {
    console.error('Error al obtener permisos:', error);
    res.status(500).json({ error: 'Error al obtener permisos' });
  }
};

const createPermiso = async (req, res) => {
  const { nombre, descripcion, padreId } = req.body;
  if (!nombre) return res.status(400).json({ error: 'El nombre es obligatorio' });

  try {
    const pool = await poolPromise;
    await pool.request()
      .input('nombre', sql.NVarChar(100), nombre)
      .input('descripcion', sql.NVarChar(255), descripcion || null)
      .input('padreId', sql.Int, padreId || null)
      .query(`
        INSERT INTO Permiso (Nombre, Descripcion, PadreId)
        VALUES (@nombre, @descripcion, @padreId)
      `);
    res.status(201).json({ message: 'Permiso creado correctamente' });
  } catch (error) {
    console.error('Error al crear permiso:', error);
    if (error.originalError?.info?.number === 2627) {
      return res.status(400).json({ error: 'El nombre del permiso ya existe' });
    }
    res.status(500).json({ error: 'Error al crear el permiso' });
  }
};

module.exports = { getPermisos, createPermiso };
