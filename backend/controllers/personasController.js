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

  try {
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
            // Manejar caso de tipo de usuario no válido
            return res.status(400).json({ error: 'Tipo de usuario inválido.' });
        }

        // -----------------------------
        // 3. Ejecutar SP (con el nuevo parámetro)
        // -----------------------------
        const pool = await poolPromise;
        const request = pool.request();

        request.input('nombre', sql.VarChar, nombre);
        request.input('contraseña', sql.VarChar, hashedPassword);
        request.input('mail', sql.VarChar, mail);
        request.input('foto', sql.VarBinary, foto || null);
        request.input('fecha_nacimiento', sql.Date, fecha_nacimiento);
        request.input('tipo_usuario', sql.VarChar, tipo_usuario);
        request.input('descripcion', sql.VarChar, descripcion || null);
        request.input('disponibilidad_horaria', sql.VarChar, disponibilidad_horaria || null);
        request.input('contacto', sql.VarChar, contacto || null);
        request.input('oficiosIds', sql.NVarChar, oficiosIds ? oficiosIds.toString() : null);
        request.input('zonasIds', sql.NVarChar, zonasIds ? zonasIds.toString() : null);
        
        // ¡Añade este nuevo input!
        request.input('grupoId', sql.Int, grupoId);

        const result = await request.execute('sp_RegistrarUsuario');
        const personaId = result.recordset?.[0]?.PersonaId;

    if (!personaId) {
      return res.status(400).json({ error: 'No se pudo registrar el usuario. El SP no devolvió un ID.' });
    }

    // -----------------------------
    // 4. Respuesta
    // -----------------------------
    res.status(201).json({
      message: 'Usuario registrado correctamente.',
      personaId
    });

  } catch (error) {
    console.error('Error al registrar persona:', error);

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
