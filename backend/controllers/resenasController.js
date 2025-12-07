const { poolPromise, sql } = require('../db');

const obtenerResenasPorTrabajador = async (req, res) => {
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
};

// Crear reseña
const crearResena = async (req, res) => {
  const { comentario, puntuacion, contratacionId } = req.body;
  
  if (!puntuacion || !contratacionId) {
    return res.status(400).json({ error: 'Puntuación y contratación son obligatorias' });
  }

  try {
    const pool = await poolPromise;

    const resultContratacion = await pool.request()
      .input('contratacionId', sql.Int, contratacionId)
      .query(`
        SELECT trabajador_id, estado_id 
        FROM Contratacion 
        WHERE id = @contratacionId
      `);

    if (resultContratacion.recordset.length === 0) {
      return res.status(404).json({ error: 'Contratación no encontrada' });
    }

    const { trabajador_id, estado_id } = resultContratacion.recordset[0];
    if (estado_id !== 4) { // 4 = Finalizada
      return res.status(400).json({ error: 'Solo se puede reseñar una contratación finalizada' });
    }

    // Verificar que no exista ya una reseña para esta contratación
    const resultResena = await pool.request()
      .input('contratacionId', sql.Int, contratacionId)
      .query(`
        SELECT id 
        FROM Reseña 
        WHERE contratacion_id = @contratacionId
      `);

    if (resultResena.recordset.length > 0) {
      return res.status(400).json({ error: 'Ya existe una reseña para esta contratación' });
    }

    // Nueva reseña
    await pool.request()
      .input('comentario', sql.VarChar(sql.MAX), comentario || '')
      .input('puntuacion', sql.Int, puntuacion)
      .input('contratacionId', sql.Int, contratacionId)
      .input('fecha', sql.Date, new Date())
      .query(`
        INSERT INTO Reseña (comentario, puntuacion, fecha, contratacion_id)
        VALUES (@comentario, @puntuacion, @fecha, @contratacionId)
      `);

    // Calcular promedio de calificación del trabajador
    const resultPromedio = await pool.request()
      .input('trabajadorId', sql.Int, trabajador_id)
      .query(`
        SELECT AVG(r.puntuacion) AS promedio
        FROM Reseña r
        JOIN Contratacion c ON r.contratacion_id = c.id
        WHERE c.trabajador_id = @trabajadorId
      `);

    const nuevoPromedio = resultPromedio.recordset[0].promedio;
    
    await pool.request()
      .input('trabajadorId', sql.Int, trabajador_id)
      .input('promedio', sql.Decimal(4, 2), nuevoPromedio)
      .query(`
        UPDATE Trabajador
        SET calificacion_promedio = @promedio
        WHERE id = @trabajadorId
      `);

    res.status(201).json({ mensaje: 'Reseña creada y calificación del trabajador actualizada con éxito' });
  } catch (error) {
    console.error('Error al crear reseña:', error);
    res.status(500).json({ error: 'Error al crear reseña' });
  }
};

module.exports = {
  obtenerResenasPorTrabajador,
  crearResena
};
