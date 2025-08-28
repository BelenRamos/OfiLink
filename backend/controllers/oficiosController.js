const { poolPromise } = require('../db');

// Obtener todos los oficios
const getOficios = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`SELECT Id, Nombre FROM Oficio ORDER BY Nombre`);
    res.json(result.recordset);
  } catch (err) {
    console.error("Error al obtener oficios:", err);
    res.status(500).json({ error: "Error del servidor" });
  }
};

module.exports = { getOficios };
