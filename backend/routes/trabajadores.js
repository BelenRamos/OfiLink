const express = require('express');
const router = express.Router();
const { poolPromise, sql } = require('../db');

// GET /api/trabajadores/:id
router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        SELECT 
          p.id,
          p.nombre,
          p.mail,
          t.descripcion,
          t.contacto,
          t.disponible,
          t.calificacion_promedio,
          STRING_AGG(o.nombre, ', ') AS oficios,
          STRING_AGG(z.nombre, ', ') AS zonas
        FROM Trabajador t
        INNER JOIN Persona p ON p.id = t.id
        LEFT JOIN Trabajador_Oficio toff ON toff.trabajador_id = t.id
        LEFT JOIN Oficio o ON o.id = toff.oficio_id
        LEFT JOIN Trabajador_Zona tz ON tz.trabajador_id = t.id
        LEFT JOIN Zona z ON z.id = tz.zona_id
        WHERE t.id = @id
        GROUP BY p.id, p.nombre, p.mail, t.descripcion, t.contacto, t.disponible, t.calificacion_promedio
      `);


    if (result.recordset.length === 0) {
      return res.status(404).json({ mensaje: 'Trabajador no encontrado' });
    }

    const trabajador = result.recordset[0];
    trabajador.oficios = [...new Set(trabajador.oficios.split(',').map(o => o.trim()))];
    trabajador.zonas = [...new Set(trabajador.zonas.split(',').map(z => z.trim()))];


    res.json(trabajador);
  } catch (err) {
    console.error('❌ ERROR COMPLETO:', err); // MÁS CLARO
    res.status(500).json({ mensaje: err.message }); // DEVOLVÉ EL MENSAJE DEL ERROR
  }

});


// GET /api/trabajadores
router.get('/', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT 
        p.id,
        p.nombre,
        p.mail,
        t.descripcion,
        t.contacto,
        t.disponible,
        t.calificacion_promedio,
        STRING_AGG(DISTINCT o.nombre, ',') AS oficios,
        STRING_AGG(DISTINCT z.nombre, ',') AS zonas
      FROM Trabajador t
      INNER JOIN Persona p ON p.id = t.id
      LEFT JOIN Trabajador_Oficio toff ON toff.trabajador_id = t.id
      LEFT JOIN Oficio o ON o.id = toff.oficio_id
      LEFT JOIN Trabajador_Zona tz ON tz.trabajador_id = t.id
      LEFT JOIN Zona z ON z.id = tz.zona_id
      GROUP BY p.id, p.nombre, p.mail, t.descripcion, t.contacto, t.disponible, t.calificacion_promedio
    `);

    const trabajadores = result.recordset.map(t => ({
      ...t,
      oficios: t.oficios ? t.oficios.split(',') : [],
      zonas: t.zonas ? t.zonas.split(',') : [],
    }));

    res.json(trabajadores);
  } catch (err) {
    console.error('❌ Error al obtener todos los trabajadores:', err);
    res.status(500).json({ mensaje: 'Error al obtener trabajadores' });
  }
});

module.exports = router;
