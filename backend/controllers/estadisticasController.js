const { poolPromise } = require("../db");

const getResumenSolicitudesYContrataciones = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT 
        (SELECT COUNT(*) FROM Solicitud) AS totalSolicitudes,
        (SELECT COUNT(*) FROM Contratacion) AS totalContrataciones
    `);

    res.json(result.recordset[0]);
  } catch (err) {
    console.error("Error al obtener resumen de actividad:", err);
    res.status(500).json({ error: "Error al obtener resumen de actividad" });
  }
};

module.exports = { getResumenSolicitudesYContrataciones };
