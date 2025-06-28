const express = require('express');
const router = express.Router();
const { poolPromise } = require('../db'); // ajustá según tu estructura

router.get('/', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM Trabajadores');
    res.json(result.recordset);
  } catch (err) {
    console.error('Error al traer trabajadores:', err);
    res.status(500).send('Error al obtener trabajadores');
  }
});

module.exports = router;

// GET /api/trabajadores
router.get('/', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT 
        t.id, 
        t.nombre, 
        t.telefono, 
        t.descripcion,
        t.estado_disponibilidad,
        z.nombre AS zona,
        STRING_AGG(o.nombre, ', ') AS oficios
      FROM Trabajadores t
      LEFT JOIN Zonas z ON t.zona_id = z.id
      LEFT JOIN Trabajadores_Oficios toff ON t.id = toff.trabajador_id
      LEFT JOIN Oficios o ON toff.oficio_id = o.id
      GROUP BY t.id, t.nombre, t.telefono, t.descripcion, t.estado_disponibilidad, z.nombre
    `);

    const trabajadores = result.recordset.map(t => ({
      ...t,
      oficios: t.oficios ? t.oficios.split(', ') : [],
    }));

    res.json(trabajadores);
  } catch (err) {
    console.error('❌ Error al obtener todos los trabajadores:', err);
    res.status(500).json({ mensaje: 'Error al obtener trabajadores' });
  }
});
