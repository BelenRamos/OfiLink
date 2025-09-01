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

    // Verificar que la contratación existe y está finalizada
    const resultContratacion = await pool.request()
      .input('contratacionId', sql.Int, contratacionId)
      .query(`
        SELECT estado_id 
        FROM Contratacion 
        WHERE id = @contratacionId
      `);

    if (resultContratacion.recordset.length === 0) {
      return res.status(404).json({ error: 'Contratación no encontrada' });
    }

    const { estado_id } = resultContratacion.recordset[0];
    if (estado_id !== 4) {
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

    // Insertar reseña
    await pool.request()
      .input('comentario', sql.VarChar(sql.MAX), comentario || '')
      .input('puntuacion', sql.Int, puntuacion)
      .input('contratacionId', sql.Int, contratacionId)
      .input('fecha', sql.Date, new Date())
      .query(`
        INSERT INTO Reseña (comentario, puntuacion, fecha, contratacion_id)
        VALUES (@comentario, @puntuacion, @fecha, @contratacionId)
      `);

    res.status(201).json({ mensaje: 'Reseña creada con éxito' });
  } catch (error) {
    console.error('Error al crear reseña:', error);
    console.log("Datos recibidos:", req.body);
    res.status(500).json({ error: 'Error al crear reseña' });
  }


};


module.exports = {
  obtenerResenasPorTrabajador,
  crearResena
};
