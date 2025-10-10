const { poolPromise, sql } = require('../db');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs/promises');
const fsSync = require('fs');
const multer = require('multer');

const uploadsDir = path.join(__dirname, '../uploads/personas');
if (!fsSync.existsSync(uploadsDir)) {
  fsSync.mkdirSync(uploadsDir, { recursive: true });
}

const fileFilter = (req, file, cb) => {
  // Solo aceptar archivos que inician con 'image/' (JPEG, PNG, GIF, etc.)
  if (file.mimetype.startsWith('image/')) cb(null, true);
  else cb(null, false);
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    // Aseguramos que el ID esté disponible para el nombre del archivo
    const id = req.params.id || 'temp'; 
    cb(null, `usuario_${id}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB
});

// Añade esta función auxiliar al inicio de tu archivo
/* const registrarAuditoria = async (pool, PersonaId, UsuarioAccionId, TipoCambio, Observaciones, ValorNuevo) => {
    try {
        await pool.request()
            .input('PersonaId', sql.Int, PersonaId)
            .input('UsuarioAccionId', sql.Int, UsuarioAccionId)
            .input('TipoCambio', sql.VarChar, TipoCambio)
            .input('Observaciones', sql.NVarChar, Observaciones || `Acción de ${TipoCambio}`)
            .input('ColumnaAfectada', sql.VarChar, 'estado_cuenta')
            .input('ValorNuevo', sql.VarChar, ValorNuevo)
            .query(`
                INSERT INTO Auditoria_Persona 
                    (PersonaId, UsuarioAccionId, TipoCambio, Observaciones, ColumnaAfectada, ValorNuevo)
                VALUES 
                    (@PersonaId, @UsuarioAccionId, @TipoCambio, @Observaciones, @ColumnaAfectada, @ValorNuevo)
            `);
    } catch (err) {
        // MUY IMPORTANTE: Si la auditoría falla, solo logueamos el error y NO detenemos el bloqueo/desbloqueo.
        console.error("Error FATAL al registrar en Auditoria_Persona:", err.message);
    }
}; */


const uploadMiddleware = (req, res, next) => {
    upload.single('foto')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ mensaje: 'El archivo es demasiado grande. Máximo permitido es 2MB.' });
            }
            return res.status(400).json({ mensaje: `Error de Multer: ${err.message}` });
        } else if (err) {
            return res.status(500).json({ mensaje: 'Error desconocido al subir el archivo.' });
        }

        if (!req.file) {
            return res.status(400).json({ mensaje: 'Formato de archivo no permitido (solo imágenes).' });
        }
        next(); 
    });
};


const subirFoto = async (req, res) => {
  const id = parseInt(req.params.id);
  
  const fotoUrl = `/uploads/personas/${req.file.filename}`;

  try {
    const pool = await poolPromise;

    // 1. Obtener foto anterior
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT foto FROM Persona WHERE id = @id');

    const fotoAnterior = result.recordset[0]?.foto;

    // 2. Actualizar BD
    await pool.request()
      .input('id', sql.Int, id)
      .input('fotoUrl', sql.VarChar, fotoUrl)
      .query('UPDATE Persona SET foto = @fotoUrl WHERE id = @id');

    // 3. Eliminar foto anterior si existe y no es la default
    if (fotoAnterior && !fotoAnterior.includes('default-avatar.png')) {
      const pathFotoAnterior = path.join(__dirname, '..', fotoAnterior);
      await fs.unlink(pathFotoAnterior).catch(err => {
            // Advertencia si la eliminación falla, pero no detenemos el proceso
            console.warn('No se pudo eliminar foto anterior:', err.message)
        });
    }

    // 4. Respuesta final
    res.json({ mensaje: 'Foto actualizada', foto_url: fotoUrl });
  } catch (err) {
    console.error('Error al guardar foto en DB:', err.message);
    
    // Si la DB falla, eliminamos la foto recién subida para evitar basura.
    await fs.unlink(req.file.path).catch(cleanupErr => {
        console.warn('Fallo la limpieza del archivo subido tras error de DB:', cleanupErr.message);
    }); 
    
    res.status(500).json({ mensaje: 'Error interno al actualizar la BD' });
  }
};

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


const getPersonas = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT 
        id,
        nombre,
        mail,
        estado_cuenta,
        tipo_usuario AS tipo
      FROM Persona
      ORDER BY nombre
    `);

    res.json(result.recordset);
  } catch (error) {
    console.error('Error al obtener personas:', error);
    res.status(500).json({ error: 'Error al obtener personas' });
  }
};

//Para recuperar la foto
const getPersonaPorId = async (req, res) => {
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
              p.contacto,
              p.foto AS foto_url,  
              p.fecha_nacimiento,
              CASE p.GrupoId
                WHEN 3 THEN 'cliente'
                WHEN 4 THEN 'trabajador'
                ELSE 'desconocido'
              END AS tipo
            FROM Persona p
            WHERE p.id = @id
        `);

        if (result.recordset.length === 0) {
            return res.status(404).json({ mensaje: 'Persona no encontrada' });
        }

        res.json(result.recordset[0]);
    } catch (error) {
        console.error('Error al obtener persona por ID:', error);
        res.status(500).json({ error: 'Error al obtener persona' });
    }
};

const getPersonasReporte = async (req, res) => {
  try {
    const { rol } = req.query; // Obtiene el valor del filtro de la URL
    const pool = await poolPromise;

    // Base de la consulta, selecciona ID, nombre y determina el rol con CASE
    let query = `
      SELECT 
        p.id AS id,
        p.nombre AS nombre,
        CASE p.GrupoId
          WHEN 1 THEN 'administrador'
          WHEN 2 THEN 'supervisor'
          WHEN 3 THEN 'cliente'
          WHEN 4 THEN 'trabajador'
          ELSE 'desconocido'
        END AS rol
      FROM Persona p
    `;

    // Determina el GrupoId para el filtro, si es que se ha solicitado uno
    let grupoIdFiltro;
    if (rol && rol !== 'todos') {
      switch (rol) {
        case 'administrador':
          grupoIdFiltro = 1;
          break;
        case 'supervisor':
          grupoIdFiltro = 2;
          break;
        case 'cliente':
          grupoIdFiltro = 3;
          break;
        case 'trabajador':
          grupoIdFiltro = 4;
          break;
        default:
          grupoIdFiltro = null;
      }
    }

    // Agrega la cláusula WHERE si se necesita filtrar
    if (grupoIdFiltro) {
      query += ` WHERE p.GrupoId = ${grupoIdFiltro}`;
    }

    // Agrega el ordenamiento al final
    query += ` ORDER BY p.nombre`;

    const result = await pool.request().query(query);
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

        // Hashear contraseña y asignar GrupoId
        const hashedPassword = await bcrypt.hash(contraseña, 10);
        let grupoId;
        if (tipo_usuario === 'cliente') {
            grupoId = 3;
        } else if (tipo_usuario === 'trabajador') {
            grupoId = 4;
        } else {
            return res.status(400).json({ error: 'Tipo de usuario inválido.' });
        }


        const request = new sql.Request(transaction);

        request.input('nombre', sql.VarChar, nombre);
        request.input('contraseña', sql.VarChar, hashedPassword);
        request.input('mail', sql.VarChar, mail);
        request.input('foto', sql.VarChar, foto || null);
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
        

        // Insertar en las tablas de relación si es trabajador
        if (tipo_usuario === 'trabajador') {
            await _insertarOficiosYZonas(transaction, personaId, oficiosIds, zonasIds);
        }

        await transaction.commit();

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
        if (error.number === 2627) { 
            return res.status(409).json({ error: 'El mail ya está en uso.' });
        }

        res.status(500).json({ error: 'Error interno al registrar persona.' });
    }
};

//Editar perfil
const actualizarPersona = async (req, res) => {
    const id = parseInt(req.params.id);
    const { 
        nombre, 
        contacto, 
        fecha_nacimiento 
        // No se permite cambiar mail o contraseña aquí
    } = req.body;

    try {
        const pool = await poolPromise;
        const request = pool.request();
        
        // 1. Validaciones (Aseguramos la integridad de los datos)
        if (!nombre || !fecha_nacimiento) {
            return res.status(400).json({ error: 'Faltan campos obligatorios para la actualización (nombre o fecha de nacimiento).' });
        }

        const phoneRegex = /^[0-9]{9,}$/;
        if (contacto && !phoneRegex.test(contacto)) {
            return res.status(400).json({ error: 'El teléfono debe tener al menos 9 números y solo dígitos.' });
        }
        
        // Validar edad mínima 18 (Igual que en registrarPersona)
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
        
        // 2. Ejecutar la actualización
        const result = await request
            .input('id', sql.Int, id)
            .input('nombre', sql.VarChar, nombre)
            .input('contacto', sql.VarChar, contacto || null)
            .input('fecha_nacimiento', sql.Date, fecha_nacimiento)
            .query(`
                UPDATE Persona 
                SET 
                    nombre = @nombre, 
                    contacto = @contacto, 
                    fecha_nacimiento = @fecha_nacimiento
                WHERE id = @id
            `);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ mensaje: 'Persona no encontrada o no se realizaron cambios.' });
        }

        // 3. Devolver los datos actualizados
        // NOTA: Para ser más RESTful, podrías llamar a getPersonaPorId para devolver
        // el objeto completo, pero por simplicidad devolvemos solo lo que se actualizó.
        res.json({ 
            mensaje: 'Perfil actualizado correctamente.',
            id,
            nombre,
            contacto,
            fecha_nacimiento 
        });

    } catch (error) {
        console.error('Error al actualizar persona:', error);
        res.status(500).json({ error: 'Error interno al actualizar persona.' });
    }
};

//Resetear Contraseña -- Solo por el admin
const resetPassword = async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await poolPromise;

    // Generar nueva contraseña aleatoria (8 caracteres seguros)
    const nuevaPassword = crypto.randomBytes(4).toString('hex'); 

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(nuevaPassword, 10);

    await pool.request()
      .input('id', sql.Int, id)
      .input('contraseña', sql.VarChar, hashedPassword)
      .query(`UPDATE Persona SET contraseña = @contraseña WHERE id = @id`);

    res.json({
      message: 'Contraseña reseteada con éxito.',
      nuevaPassword // ⚠️ Se devuelve solo al admin, no se guarda en ningún lado sin hash
    });
  } catch (error) {
    console.error('Error al resetear contraseña:', error);
    res.status(500).json({ error: 'Error al resetear contraseña' });
  }
};


const modificarEstadoCuenta = async (req, res) => {
    const { id } = req.params; // ID de la persona a ser afectada
    const { nuevoEstado, motivo } = req.body; // 'Bloqueado' o 'Activo'
    
    // Asumimos que req.usuario.id es inyectado por el middleware JWT del administrador
    const adminId = req.usuario.id; 

    // Validación de entrada
    if (!['Activo', 'Bloqueado'].includes(nuevoEstado)) {
        return res.status(400).json({ error: 'Estado de cuenta inválido. Solo se permite "Activo" o "Bloqueado".' });
    }

    try {
        const pool = await poolPromise;
        
        // 1. Obtener el estado actual
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('SELECT estado_cuenta FROM Persona WHERE id = @id');
        
        const estadoAnterior = result.recordset[0]?.estado_cuenta;
        
        if (!estadoAnterior) {
             return res.status(404).json({ mensaje: 'Persona no encontrada.' });
        }

        // 2. (Skipping tipoCambio variable as it's only for audit)
        
        // 3. Actualizar el estado en la tabla Persona
        const updateResult = await pool.request()
            .input('id', sql.Int, id)
            .input('nuevoEstado', sql.VarChar, nuevoEstado)
            .query(`
                UPDATE Persona 
                SET estado_cuenta = @nuevoEstado 
                WHERE id = @id AND estado_cuenta <> @nuevoEstado 
            `);
            
        if (updateResult.rowsAffected[0] === 0 && estadoAnterior !== nuevoEstado) {
             return res.status(404).json({ mensaje: 'Persona no encontrada o estado sin cambio.' });
        }


        // 4. Registrar la acción en la tabla de Auditoría (COMENTADO PARA DESACTIVAR)
        /*
        await registrarAuditoria(
            pool, 
            id, 
            adminId, 
            tipoCambio, 
            motivo, 
            nuevoEstado
        );
        */

        res.status(200).json({ 
            mensaje: `Cuenta de ID ${id} cambiada a estado: ${nuevoEstado}.`,
            estado: nuevoEstado 
        });

    } catch (err) {
        console.error(`Error al modificar el estado de la cuenta:`, err);
        res.status(500).json({ error: 'Error del servidor al cambiar el estado de la cuenta.' });
    }
};

module.exports = {
  getPersonasReporte,
  registrarPersona,
  getResumenPersonas,
  getPersonas,
  getPersonaPorId,
  resetPassword,
  subirFoto,
  actualizarPersona,
  modificarEstadoCuenta,
  uploadMiddleware // Exportamos la función de middleware con el manejo de errores de Multer
};
