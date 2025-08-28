const { poolPromise } = require('../db');

// Obtener todas las zonas
const getZonas = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`SELECT Id, Nombre FROM Zona ORDER BY Nombre`);
    res.json(result.recordset);
  } catch (err) {
    console.error("Error al obtener zonas:", err);
    res.status(500).json({ error: "Error del servidor" });
  }
};

module.exports = { getZonas };
