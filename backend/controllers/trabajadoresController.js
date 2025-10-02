const { poolPromise, sql } = require('../db');

const filtrarTrabajadores = async (req, res) => {
  const { oficio, zona } = req.query;
  const zonaNombre = zona?.replace('Zona ', '');

  try {
    const pool = await poolPromise;
    const request = pool.request();

    let filtros = `1 = 1`;

    if (oficio?.trim()) {
      request.input('oficio', sql.VarChar, `%${oficio.trim().toLowerCase()}%`);
      filtros += `
        AND t.id IN (
          SELECT to2.trabajador_id
          FROM Trabajador_Oficio to2
          JOIN Oficio o2 ON o2.id = to2.oficio_id
          WHERE LOWER(o2.nombre) LIKE @oficio
        )
      `;
    }

    if (zonaNombre?.trim()) {
      request.input('zona', sql.VarChar, `%${zonaNombre.trim().toLowerCase()}%`);
      filtros += `
        AND t.id IN (
          SELECT tz2.trabajador_id
          FROM Trabajador_Zona tz2
          JOIN Zona z2 ON z2.id = tz2.zona_id
          WHERE LOWER(z2.nombre) LIKE @zona
        )
      `;
    }

    const result = await request.query(`
      SELECT 
        p.id,
        p.nombre,
        p.mail,
        t.descripcion,
        t.contacto,
        t.disponible,
        t.calificacion_promedio,
        (
          SELECT STRING_AGG(nombre, ',')
          FROM (
            SELECT DISTINCT o2.nombre
            FROM Trabajador_Oficio to2
            JOIN Oficio o2 ON o2.id = to2.oficio_id
            WHERE to2.trabajador_id = t.id
          ) AS oficiosUnicos
        ) AS oficios,
        (
          SELECT STRING_AGG(nombre, ',')
          FROM (
            SELECT DISTINCT z2.nombre
            FROM Trabajador_Zona tz2
            JOIN Zona z2 ON z2.id = tz2.zona_id
            WHERE tz2.trabajador_id = t.id
          ) AS zonasUnicas
        ) AS zonas
      FROM Trabajador t
      INNER JOIN Persona p ON p.id = t.id
      WHERE ${filtros}
    `);

    const trabajadores = result.recordset.map(t => ({
      ...t,
      oficios: t.oficios ? t.oficios.split(',').map(o => o.trim()) : [],
      zonas: t.zonas ? t.zonas.split(',').map(z => z.trim()) : [],
    }));

    res.json(trabajadores);
  } catch (err) {
    console.error('❌ Error al filtrar trabajadores:', err.message);
    res.status(500).json({ mensaje: 'Error interno al filtrar trabajadores' });
  }
};

const obtenerTrabajadorPorId = async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    const pool = await poolPromise;
    const request = pool.request().input('id', sql.Int, id);

    const result = await request.query(`
      SELECT 
        p.id,
        p.nombre,
        p.mail,
        t.descripcion,
        t.contacto,
        t.disponible,
        t.calificacion_promedio,
        (
          SELECT STRING_AGG(nombre, ',')
          FROM (
            SELECT DISTINCT o2.nombre
            FROM Trabajador_Oficio to2
            JOIN Oficio o2 ON o2.id = to2.oficio_id
            WHERE to2.trabajador_id = t.id
          ) AS oficiosUnicos
        ) AS oficios,
        (
          SELECT STRING_AGG(nombre, ',')
          FROM (
            SELECT DISTINCT z2.nombre
            FROM Trabajador_Zona tz2
            JOIN Zona z2 ON z2.id = tz2.zona_id
            WHERE tz2.trabajador_id = t.id
          ) AS zonasUnicas
        ) AS zonas
      FROM Trabajador t
      INNER JOIN Persona p ON p.id = t.id
      WHERE t.id = @id
    `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ mensaje: 'Trabajador no encontrado' });
    }

    const t = result.recordset[0];
    const trabajador = {
      ...t,
      oficios: t.oficios ? t.oficios.split(',').map(o => o.trim()) : [],
      zonas: t.zonas ? t.zonas.split(',').map(z => z.trim()) : [],
      zona: t.zonas ? t.zonas.split(',').map(z => z.trim()).join(', ') : '',
      telefono: t.contacto,
    };

    res.json(trabajador);
  } catch (err) {
    console.error('❌ Error al obtener trabajador por ID:', err.message);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

const actualizarDisponibilidad = async (req, res) => {
  const id = parseInt(req.params.id);
  const { disponible } = req.body; // true / false

  try {
    const pool = await poolPromise;
    const request = pool.request()
      .input('id', sql.Int, id)
      .input('disponible', sql.Bit, disponible ? 1 : 0);

    const result = await request.query(`
      UPDATE Trabajador
      SET disponible = @disponible
      WHERE id = @id;

      SELECT disponible FROM Trabajador WHERE id = @id;
    `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ mensaje: 'Trabajador no encontrado' });
    }

    res.json({
      mensaje: 'Disponibilidad actualizada',
      disponible: result.recordset[0].disponible
    });
  } catch (err) {
    console.error('❌ Error al actualizar disponibilidad:', err.message);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};



module.exports = {
  filtrarTrabajadores,
  obtenerTrabajadorPorId,
  actualizarDisponibilidad
};
