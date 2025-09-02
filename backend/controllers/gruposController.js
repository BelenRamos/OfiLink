const { poolPromise, sql } = require('../db');

const getGrupos = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .query(`SELECT Id, Nombre FROM Grupo ORDER BY Nombre`);
    res.json(result.recordset);
  } catch (error) {
    console.error('Error al obtener grupos:', error);
    res.status(500).json({ error: 'Error al obtener grupos' });
  }
};

const createGrupo = async (req, res) => {
  const { nombre } = req.body;
  if (!nombre) return res.status(400).json({ error: 'El nombre es obligatorio' });

  try {
    const pool = await poolPromise;
    await pool.request()
      .input('nombre', sql.NVarChar(100), nombre)
      .query(`INSERT INTO Grupo (Nombre) VALUES (@nombre)`);
    res.status(201).json({ message: 'Grupo creado correctamente' });
  } catch (error) {
    console.error('Error al crear grupo:', error);
    if (error.originalError?.info?.number === 2627) {
      return res.status(400).json({ error: 'El nombre del grupo ya existe' });
    }
    res.status(500).json({ error: 'Error al crear el grupo' });
  }
};

module.exports = { getGrupos, createGrupo };
