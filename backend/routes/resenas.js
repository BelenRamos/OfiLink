const express = require('express');
const router = express.Router();
const { poolPromise, sql } = require('../db');

// GET /api/resenas/trabajador/:id
router.get('/trabajador/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        SELECT 
          r.id, 
          r.comentario, 
          r.puntuacion, 
          p.nombre AS nombre_cliente
        FROM Reseña r
        INNER JOIN Contratacion c ON r.contratacion_id = c.id
        INNER JOIN Cliente cli ON cli.id = c.cliente_id
        INNER JOIN Persona p ON p.id = cli.id
        WHERE c.trabajador_id = @id
        ORDER BY r.id DESC
      `);

    res.json(result.recordset);
  } catch (err) {
    console.error('❌ Error en GET /api/resenas/trabajador/:id', err);
    res.status(500).json({ mensaje: 'Error al obtener reseñas' });
  }
});

module.exports = router;
