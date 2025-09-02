const { poolPromise, sql } = require('../db');

const getAsignaciones = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .query(`
        SELECT 
          gr.GrupoId,
          g.Nombre AS GrupoNombre,
          gr.RolId,
          r.Nombre AS RolNombre
        FROM Grupo_Rol gr
        INNER JOIN Grupo g ON gr.GrupoId = g.Id
        INNER JOIN Rol r ON gr.RolId = r.Id
        ORDER BY g.Nombre, r.Nombre
      `);
    res.json(result.recordset);
  } catch (error) {
    console.error('Error al obtener asignaciones:', error);
    res.status(500).json({ error: 'Error al obtener asignaciones' });
  }
};

const createAsignacion = async (req, res) => {
  const { grupoId, rolId } = req.body;
  if (!grupoId || !rolId) {
    return res.status(400).json({ error: 'grupoId y rolId son obligatorios' });
  }

  try {
    const pool = await poolPromise;
    await pool.request()
      .input('grupoId', sql.Int, grupoId)
      .input('rolId', sql.Int, rolId)
      .query(`
        INSERT INTO Grupo_Rol (GrupoId, RolId)
        VALUES (@grupoId, @rolId)
      `);
    res.status(201).json({ message: 'Asignación creada correctamente' });
  } catch (error) {
    console.error('Error al crear asignación:', error);
    if (error.originalError?.info?.number === 2627) {
      return res.status(400).json({ error: 'La asignación ya existe' });
    }
    res.status(500).json({ error: 'Error al crear la asignación' });
  }
};

module.exports = { getAsignaciones, createAsignacion };
