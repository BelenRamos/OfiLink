const express = require('express');
const router = express.Router();
const { poolPromise, sql } = require('../db'); // Ajusta la ruta según tu estructura

// GET /api/trabajadores/:id
router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        SELECT t.id, t.nombre, t.descripcion, t.telefono, z.nombre AS zona,
          STRING_AGG(o.nombre, ',') AS oficios
        FROM Trabajadores t
        LEFT JOIN Trabajadores_Oficios toff ON toff.trabajador_id = t.id
        LEFT JOIN Oficios o ON o.id = toff.oficio_id
        LEFT JOIN Zonas z ON z.id = t.zona_id
        WHERE t.id = @id
        GROUP BY t.id, t.nombre, t.descripcion, t.telefono, z.nombre
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ mensaje: 'Trabajador no encontrado' });
    }

    // Convertir oficios de string a array
    const trabajador = result.recordset[0];
    trabajador.oficios = trabajador.oficios ? trabajador.oficios.split(',') : [];

    res.json(trabajador);

  } catch (err) {
    console.error('Error en GET /api/trabajadores/:id', err);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

// GET /api/reseñas/trabajador/:id
router.get('/reseñas/trabajador/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        SELECT r.id, r.comentario, r.puntuacion, c.nombre AS nombre_cliente
        FROM Reseñas r
        INNER JOIN Clientes c ON c.id = r.cliente_id
        WHERE r.trabajador_id = @id
        ORDER BY r.id DESC
      `);

    res.json(result.recordset);

  } catch (err) {
    console.error('Error en GET /api/reseñas/trabajador/:id', err);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

module.exports = router;
