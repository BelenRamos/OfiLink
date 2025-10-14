const { poolPromise, sql } = require('../db');


const filtrarTrabajadores = async (req, res) => {
  const { oficio, zona } = req.query;
  const zonaNombre = zona?.replace('Zona ', '');

  try {
    const pool = await poolPromise;
    const request = pool.request();

    let filtros = `1 = 1`;
    filtros += ` AND p.estado_cuenta = 'Activo'`;

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
        p.foto AS foto_url,
        p.contacto,   -- 💡 CORRECCIÓN: Ahora se selecciona de la tabla Persona (p)
        t.descripcion,
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
        p.foto AS foto_url, 
        p.contacto,   -- 💡 CORRECCIÓN: Ahora se selecciona de la tabla Persona (p)
        t.descripcion,
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

const actualizarTrabajador = async (req, res) => {
    const trabajadorId = parseInt(req.params.id);
    const { 
        descripcion, 
        disponibilidad_horaria, 
        oficiosIds, 
        zonasIds 
    } = req.body;

    // Validación básica (Frontend también la hace)
    if (!oficiosIds || oficiosIds.length === 0) {
        return res.status(400).json({ error: 'Debe seleccionar al menos un oficio.' });
    }
    if (!zonasIds || zonasIds.length === 0) {
        return res.status(400).json({ error: 'Debe seleccionar al menos una zona.' });
    }
    
    let transaction;
    try {
        const pool = await poolPromise;
        transaction = new sql.Transaction(pool);
        await transaction.begin();
        
        // Usamos este request para las operaciones fuera de los ciclos (UPDATE, DELETE)
        const request = new sql.Request(transaction); 

        // 1. Actualizar los campos directos en la tabla Trabajador
        await request
            .input('id', sql.Int, trabajadorId)
            .input('descripcion', sql.VarChar, descripcion || null)
            .input('disponibilidad_horaria', sql.VarChar, disponibilidad_horaria || null)
            .query(`
                UPDATE Trabajador 
                SET 
                    descripcion = @descripcion, 
                    disponibilidad_horaria = @disponibilidad_horaria
                WHERE id = @id
            `);

        // 2. Manejar Oficios

        // a) Eliminar todos los oficios existentes para este trabajador
        await request.query(`DELETE FROM Trabajador_Oficio WHERE trabajador_id = @id`);

        // b) Insertar los nuevos oficios
        if (oficiosIds && oficiosIds.length > 0) {
            for (const oficioId of oficiosIds) {
                // 💡 SOLUCIÓN: Crear una NUEVA instancia de Request para aislar el parámetro
                const oficioRequest = new sql.Request(transaction); 
                await oficioRequest
                    .input('id', sql.Int, trabajadorId) // Reutilizamos el ID del trabajador
                    .input('oficio_id_insert', sql.Int, parseInt(oficioId))
                    .query('INSERT INTO Trabajador_Oficio (trabajador_id, oficio_id) VALUES (@id, @oficio_id_insert)');
            }
        }
        
        // 3. Manejar Zonas

        // a) Eliminar todas las zonas existentes para este trabajador
        await request.query(`DELETE FROM Trabajador_Zona WHERE trabajador_id = @id`);

        // b) Insertar las nuevas zonas
        if (zonasIds && zonasIds.length > 0) {
            for (const zonaId of zonasIds) {
                // 💡 SOLUCIÓN: Crear una NUEVA instancia de Request para aislar el parámetro
                const zonaRequest = new sql.Request(transaction); 
                await zonaRequest
                    .input('id', sql.Int, trabajadorId) // Reutilizamos el ID del trabajador
                    .input('zona_id_insert', sql.Int, parseInt(zonaId))
                    .query('INSERT INTO Trabajador_Zona (trabajador_id, zona_id) VALUES (@id, @zona_id_insert)');
            }
        }
        
        await transaction.commit();

        // 4. Devolver el perfil completo y formateado para que el frontend no rompa
        // Usamos la misma consulta que obtenerTrabajadorPorId para obtener los datos recién guardados

        const requestFinal = new sql.Request(pool); // <-- USAMOS EL POOL, NO LA TRANSACTION FINALIZADA
        const resultFinal = await requestFinal.input('id', sql.Int, trabajadorId).query(`
            SELECT 
                p.id,
                p.nombre,
                p.mail,
                p.foto AS foto_url,
                p.contacto, 
                t.descripcion,
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

        if (resultFinal.recordset.length === 0) {
            return res.status(404).json({ error: 'Error al recuperar el perfil actualizado.' });
        }

        // Formateamos la respuesta igual que obtenerTrabajadorPorId
        const t = resultFinal.recordset[0];
        const trabajadorActualizado = {
            ...t,
            // Convertimos las cadenas STRING_AGG a arrays de strings para el frontend
            oficios: t.oficios ? t.oficios.split(',').map(o => o.trim()) : [],
            zonas: t.zonas ? t.zonas.split(',').map(z => z.trim()) : [],
            // El frontend espera la propiedad 'zona' como string para mostrar
            zona: t.zonas ? t.zonas.split(',').map(z => z.trim()).join(', ') : '', 
        };

        res.json(trabajadorActualizado);

    } catch (error) {
        // 💡 SOLUCIÓN: Comprobar si 'transaction' existe y si la transacción está activa
        if (transaction && transaction.finished !== true) {
            await transaction.rollback();
        }
        
        console.error('Error al actualizar perfil de trabajador:', error.message);
        res.status(500).json({ error: 'Error interno al actualizar perfil de trabajador.' });
    }
};


module.exports = {
  filtrarTrabajadores,
  obtenerTrabajadorPorId,
  actualizarDisponibilidad,
  actualizarTrabajador
};
