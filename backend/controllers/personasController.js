const { poolPromise, sql } = require('../db');

// GET /api/personas/resumen
const getResumenPersonas = async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT
        COUNT(*) AS totalUsuarios,
        SUM(CASE WHEN tipo_usuario = 'trabajador' THEN 1 ELSE 0 END) AS totalTrabajadores,
        SUM(CASE WHEN tipo_usuario = 'cliente' THEN 1 ELSE 0 END) AS totalClientes,
        (SELECT COUNT(*) FROM Contratacion) AS totalContrataciones,
        (SELECT COUNT(*) FROM Oficio) AS totalOficios
      FROM Persona
    `);

    res.json(result.recordset[0]);
  } catch (error) {
    console.error('Error al obtener resumen de personas:', error);
    res.status(500).json({ error: 'Error al obtener el resumen de personas' });
  }
};

module.exports = {
  getResumenPersonas
};
