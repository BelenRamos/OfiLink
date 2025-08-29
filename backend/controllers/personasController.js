const { poolPromise, sql } = require('../db');
const bcrypt = require('bcrypt');

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


////Para nueva persona
// Función auxiliar para insertar oficios y zonas en las tablas de relación
const _insertarOficiosYZonas = async (pool, trabajadorId, oficiosIds, zonasIds) => {
    try {
        // Inserción de oficios del trabajador
        if (oficiosIds && oficiosIds.length > 0) {
            for (const oficioId of oficiosIds) {
                await pool.request()
                    .input('trabajador_id', sql.Int, trabajadorId)
                    .input('oficio_id', sql.Int, parseInt(oficioId))
                    .query('INSERT INTO Trabajador_Oficio (trabajador_id, oficio_id) VALUES (@trabajador_id, @oficio_id)');
            }
        }

        // Inserción de zonas del trabajador
        if (zonasIds && zonasIds.length > 0) {
            for (const zonaId of zonasIds) {
                await pool.request()
                    .input('trabajador_id', sql.Int, trabajadorId)
                    .input('zona_id', sql.Int, parseInt(zonaId))
                    .query('INSERT INTO Trabajador_Zona (trabajador_id, zona_id) VALUES (@trabajador_id, @zona_id)');
            }
        }
    } catch (error) {
        console.error('Error al insertar oficios y zonas:', error);
        throw new Error('Error al asociar oficios y zonas al trabajador.');
    }
};

// POST /api/personas/registrar
const registrarPersona = async (req, res) => {
    const {
        nombre,
        contraseña,
        mail,
        foto,
        fecha_nacimiento,
        tipo_usuario,
        descripcion,
        disponibilidad_horaria,
        contacto,
        oficiosIds,
        zonasIds
    } = req.body;

    // Inicia una transacción para asegurar que todas las operaciones se completen
    let transaction;
    try {
        const pool = await poolPromise;
        transaction = new sql.Transaction(pool);
        await transaction.begin();

        // -----------------------------
        // 1. Validaciones mejoradas y completas
        // -----------------------------

        // Validar campos obligatorios
        if (!nombre || !contraseña || !mail || !fecha_nacimiento || !tipo_usuario) {
            return res.status(400).json({ error: 'Faltan campos obligatorios.' });
        }

        // Validar longitud de la contraseña
        if (contraseña.length < 8) {
            return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres.' });
        }

        // Validar email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(mail)) {
            return res.status(400).json({ error: 'El mail no es válido.' });
        }

        // Validar edad mínima 18
        const nacimiento = new Date(fecha_nacimiento);
        const hoy = new Date();
        let edad = hoy.getFullYear() - nacimiento.getFullYear();
        const m = hoy.getMonth() - nacimiento.getMonth();
        if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
            edad--;
        }
        if (edad < 18) {
            return res.status(400).json({ error: 'El usuario debe ser mayor de 18 años.' });
        }

        // Validar teléfono (solo si se manda)
        const phoneRegex = /^[0-9]{9,}$/;
        if (contacto && !phoneRegex.test(contacto)) {
            return res.status(400).json({ error: 'El teléfono debe tener al menos 9 números y solo dígitos.' });
        }

        // -----------------------------
        // 2. Hashear contraseña y asignar GrupoId
        // -----------------------------
        const hashedPassword = await bcrypt.hash(contraseña, 10);
        let grupoId;
        if (tipo_usuario === 'cliente') {
            grupoId = 3;
        } else if (tipo_usuario === 'trabajador') {
            grupoId = 4;
        } else {
            return res.status(400).json({ error: 'Tipo de usuario inválido.' });
        }

        // -----------------------------
        // 3. Registrar persona y trabajador/cliente en la base de datos
        // -----------------------------
        const request = new sql.Request(transaction);

        request.input('nombre', sql.VarChar, nombre);
        request.input('contraseña', sql.VarChar, hashedPassword);
        request.input('mail', sql.VarChar, mail);
        request.input('foto', sql.VarBinary, foto || null);
        request.input('fecha_nacimiento', sql.Date, fecha_nacimiento);
        request.input('tipo_usuario', sql.VarChar, tipo_usuario);
        request.input('grupoId', sql.Int, grupoId);
        request.input('descripcion', sql.VarChar, descripcion || null);
        request.input('disponibilidad_horaria', sql.VarChar, disponibilidad_horaria || null);
        request.input('contacto', sql.VarChar, contacto || null);
        request.input('calificacion_promedio', sql.Float, 0); // Valor inicial
        request.input('disponible', sql.Bit, true); // Valor inicial

        const result = await request.execute('sp_RegistrarUsuario');
        const personaId = result.recordset?.[0]?.PersonaId;

        if (!personaId) {
            await transaction.rollback();
            return res.status(400).json({ error: 'No se pudo registrar el usuario. El SP no devolvió un ID.' });
        }
        
        // -----------------------------
        // 4. Insertar en las tablas de relación si es trabajador
        // -----------------------------
        if (tipo_usuario === 'trabajador') {
            await _insertarOficiosYZonas(transaction, personaId, oficiosIds, zonasIds);
        }

        await transaction.commit();

        // -----------------------------
        // 5. Respuesta
        // -----------------------------
        res.status(201).json({
            message: 'Usuario registrado correctamente.',
            personaId
        });

    } catch (error) {
        console.error('Error al registrar persona:', error);

        if (transaction) {
            await transaction.rollback();
        }

        // Error por mail duplicado
        if (error.number === 2627) { // SQL Server error code for unique constraint violation
            return res.status(409).json({ error: 'El mail ya está en uso.' });
        }

        res.status(500).json({ error: 'Error interno al registrar persona.' });
    }
};


module.exports = {
  getResumenPersonas,
  getPersonasReporte,
  registrarPersona
};
