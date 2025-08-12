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

const getPersonasReporte = async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT 
        p.id AS id,
        p.nombre AS nombre,
        o.nombre AS oficio,
        z.nombre AS zona
      FROM Persona p
      LEFT JOIN Trabajador t ON t.id = p.id
      LEFT JOIN Trabajador_Oficio tofi ON tofi.trabajador_id = t.id
      LEFT JOIN Oficio o ON o.id = tofi.oficio_id
      LEFT JOIN Trabajador_Zona tz ON tz.trabajador_id = t.id
      LEFT JOIN Zona z ON z.id = tz.zona_id
      ORDER BY p.nombre
    `);

    res.json(result.recordset);
  } catch (error) {
    console.error('Error al obtener el reporte de personas:', error);
    res.status(500).json({ error: 'Error al obtener el reporte de personas' });
  }
};

module.exports = {
  getResumenPersonas,
  getPersonasReporte
};
