const { poolPromise, sql } = require('../db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { registrarAuditoria } = require('./personasController');
require('dotenv').config(); // leer .env
const SECRET_KEY = process.env.SECRET_KEY;

const ROLE_PRIORITIES = {
    'administrador': { priority: 1, route: '/admin' },
    'supervisor':    { priority: 2, route: '/admin' },
    'cliente':       { priority: 5, route: '/home' },
    'visitor':       { priority: 6, route: '/home' },
    'default':       { priority: 99, route: '/home' } // Fallback
};

const determinarRutaInicio = (rolesKeys) => {
    let mejorPrioridad = ROLE_PRIORITIES.default.priority;
    let mejorRuta = ROLE_PRIORITIES.default.route;
    
    // Si no hay roles, usa el default
    if (!rolesKeys || rolesKeys.length === 0) {
        return mejorRuta;
    }

    // Iterar sobre los roles del usuario y encontrar la mejor prioridad
    for (const roleKey of rolesKeys) {
        const roleData = ROLE_PRIORITIES[roleKey];
        
        // Si el rol existe en nuestro mapa y tiene una mejor prioridad
        if (roleData && roleData.priority < mejorPrioridad) {
            mejorPrioridad = roleData.priority;
            mejorRuta = roleData.route;
        }
    }
    
    return mejorRuta;
};

// Función auxiliar para registrar en SessionLog
const registrarSessionLog = async (personaId, accion) => {
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('personaId', sql.Int, personaId)
      .input('accion', sql.VarChar, accion) // "login" | "logout"
      .query(`
        INSERT INTO SessionLog (PersonaId, AccionLog, FechaHoraLog)
        VALUES (@personaId, @accion, GETUTCDATE())
      `);
  } catch (err) {
    console.error("Error registrando SessionLog:", err.message);
  }
};

const login = async (req, res) => {
  const { usuario, password } = req.body;

  try {
    const pool = await poolPromise;

    // ----------------------------------------------------
    // PASO 1: Consulta Rápida de Autenticación (Solo hash)
    // ----------------------------------------------------
    const resultAuth = await pool.request()
      .input('usuario', sql.VarChar, usuario)
      .query(`
        SELECT p.id, p.nombre, p.mail, p.contraseña, p.GrupoId, p.estado_cuenta
        FROM Persona p
        WHERE p.mail = @usuario;
      `);

    if (resultAuth.recordset.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const usuarioAuth = resultAuth.recordset[0];

    // Validar esatdo de cuenta
    if (usuarioAuth.estado_cuenta === 'Bloqueado') {
      return res.status(403).json({ error: 'Tu cuenta ha sido bloqueada por una sanción administrativa.' });
    }
    if (usuarioAuth.estado_cuenta === 'Eliminado') {
      return res.status(403).json({ error: 'Esta cuenta ha sido eliminada por solicitud del usuario.' });
    }

    // Validar contraseña
    const passwordValida = await bcrypt.compare(password, usuarioAuth.contraseña);
    if (!passwordValida) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    // ----------------------------------------------------
    // PASO 2: Consulta Lenta (Roles y Permisos) - Solo si autentica
    // ----------------------------------------------------
    // Usamos el ID del grupo para optimizar las subconsultas
    const grupoId = usuarioAuth.GrupoId;

    const resultData = await pool.request()
      .input('grupoId', sql.Int, grupoId)
      .query(`
        SELECT
            g.Nombre AS grupo,
            (
                SELECT STRING_AGG(r.Nombre, ',')
                FROM Grupo_Rol gr
                JOIN Rol r ON gr.RolId = r.Id
                WHERE gr.GrupoId = @grupoId
            ) AS roles,
            (
                SELECT STRING_AGG(LOWER(REPLACE(r.Nombre, ' ', '')), ',')
                FROM Grupo_Rol gr
                JOIN Rol r ON gr.RolId = r.Id
                WHERE gr.GrupoId = @grupoId
            ) AS roles_keys,
            (
                SELECT STRING_AGG(perm.Nombre, ',')
                FROM Rol r
                JOIN Rol_Permiso rp ON r.Id = rp.RolId
                JOIN Permiso perm ON rp.PermisoId = perm.Id
                WHERE r.Id IN (
                    SELECT RolId FROM Grupo_Rol gr
                    WHERE gr.GrupoId = @grupoId
                )
            ) AS permisos_keys
        FROM Grupo g
        WHERE g.Id = @grupoId;
      `);

    const usuarioCompleto = { ...usuarioAuth, ...resultData.recordset[0] };
    const rolesKeysArray = usuarioCompleto.roles_keys ? usuarioCompleto.roles_keys.split(',') : [];
    
    usuarioCompleto.roles = usuarioCompleto.roles ? usuarioCompleto.roles.split(',') : [];
    usuarioCompleto.roles_keys = rolesKeysArray; 
    usuarioCompleto.permisos_keys = usuarioCompleto.permisos_keys ? usuarioCompleto.permisos_keys.split(',') : [];

    // ----------------------------------------------------
    // PASO 3: DETERMINAR RUTA DE INICIO ESCALABLE
    // ----------------------------------------------------
    const rutaInicio = determinarRutaInicio(rolesKeysArray);
    usuarioCompleto.ruta_inicio = rutaInicio; 

    const token = jwt.sign(
        {
            id: usuarioCompleto.id,
            nombre: usuarioCompleto.nombre,
            mail: usuarioCompleto.mail,
            GrupoId: usuarioCompleto.GrupoId,
            roles_keys: usuarioCompleto.roles_keys,
            permisos_keys: usuarioCompleto.permisos_keys,
            ruta_inicio: rutaInicio, // Incluir en el JWT para futuras validaciones
        },
        SECRET_KEY,
        { expiresIn: '2h' }
    );

    // Limpiar hash
    delete usuarioCompleto.contraseña;

    // Log de login
    registrarSessionLog(usuarioCompleto.id, 'login');

    res.json({ usuario: usuarioCompleto, token });

    } catch (err) {
        console.error('Error al iniciar sesión:', err);
        res.status(500).json({ error: 'Error del servidor' });
    }
};

//Esta es de la ultima version
/* const login = async (req, res) => {
  const { usuario, password } = req.body;

  try {
    const pool = await poolPromise;

    // Obtener usuario, roles y permisos en una sola consulta
    const result = await pool.request()
      .input('usuario', sql.VarChar, usuario)
      .query(`
        SELECT
            p.id,
            p.nombre,
            p.mail,
            p.contraseña,
            p.tipo_usuario,
            g.Nombre AS grupo,
            (
                SELECT STRING_AGG(Rol, ',')
                FROM (
                    SELECT DISTINCT r.Nombre AS Rol
                    FROM Grupo_Rol gr
                    JOIN Rol r ON gr.RolId = r.Id
                    WHERE gr.GrupoId = g.Id
                ) AS RolesSubconsulta
            ) AS roles,
            (
                SELECT STRING_AGG(LOWER(REPLACE(Rol, ' ', '')), ',')
                FROM (
                    SELECT DISTINCT r.Nombre AS Rol
                    FROM Grupo_Rol gr
                    JOIN Rol r ON gr.RolId = r.Id
                    WHERE gr.GrupoId = g.Id
                ) AS RolesSubconsulta
            ) AS roles_keys,
            (
                SELECT STRING_AGG(Permiso, ',')
                FROM (
                    SELECT DISTINCT perm.Nombre AS Permiso
                    FROM Rol r
                    JOIN Rol_Permiso rp ON r.Id = rp.RolId
                    JOIN Permiso perm ON rp.PermisoId = perm.Id
                    WHERE r.Id IN (
                        SELECT RolId FROM Grupo_Rol gr
                        WHERE gr.GrupoId = g.Id
                    )
                ) AS PermisosSubconsulta
            ) AS permisos_keys
        FROM Persona p
        LEFT JOIN Grupo g ON p.GrupoId = g.Id
        WHERE p.mail = @usuario;
      `);

    if (result.recordset.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const usuarioEncontrado = result.recordset[0];


    // Validar contraseña
    const passwordValida = await bcrypt.compare(password, usuarioEncontrado.contraseña);
    if (!passwordValida) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Preparar campos del usuario
    usuarioEncontrado.roles = usuarioEncontrado.roles ? usuarioEncontrado.roles.split(',') : [];
    usuarioEncontrado.roles_keys = usuarioEncontrado.roles_keys ? usuarioEncontrado.roles_keys.split(',') : [];
    usuarioEncontrado.permisos_keys = usuarioEncontrado.permisos_keys ? usuarioEncontrado.permisos_keys.split(',') : [];
   
    //console.log('Objeto de usuario recibido de la base de datos:', usuarioEncontrado);
   
    // Generar JWT con roles y permisos
    const token = jwt.sign(
      {
        id: usuarioEncontrado.id,
        nombre: usuarioEncontrado.nombre,
        mail: usuarioEncontrado.mail,
        roles_keys: usuarioEncontrado.roles_keys,
        permisos_keys: usuarioEncontrado.permisos_keys,
      },
      SECRET_KEY,
      { expiresIn: '2h' }
    );

    // Limpiar hash
    delete usuarioEncontrado.contraseña;

    // Log de login
    registrarSessionLog(usuarioEncontrado.id, 'login');

    res.json({ usuario: usuarioEncontrado, token });

  } catch (err) {
    console.error('Error al iniciar sesión:', err);
    res.status(500).json({ error: 'Error del servidor' });
  }
}; */

//Esta ya no iria mas
/* const login = async (req, res) => {
  const { usuario, password } = req.body;

  try {
    const pool = await poolPromise;

    // Usuario por mail (con la contraseña hasheada)
    const result = await pool.request()
      .input('usuario', sql.VarChar, usuario)
      .query(`
        SELECT
          p.id,
          p.nombre,
          p.mail,
          p.contraseña, --hash guardado
          p.tipo_usuario,
          g.Nombre AS grupo,
          STRING_AGG(r.Nombre, ',') AS roles,
          STRING_AGG(LOWER(REPLACE(r.Nombre, ' ', '')), ',') AS roles_keys
        FROM Persona p
        LEFT JOIN Grupo g ON p.GrupoId = g.Id
        LEFT JOIN Grupo_Rol gr ON g.Id = gr.GrupoId
        LEFT JOIN Rol r ON gr.RolId = r.Id
        WHERE p.mail = @usuario
        GROUP BY p.id, p.nombre, p.mail, p.contraseña, p.tipo_usuario, g.Nombre
      `);

    if (result.recordset.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const usuarioEncontrado = result.recordset[0];

    // Validar contraseña con bcrypt
    const passwordValida = await bcrypt.compare(password, usuarioEncontrado.contraseña);
    if (!passwordValida) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Roles?
    usuarioEncontrado.roles = usuarioEncontrado.roles ? usuarioEncontrado.roles.split(',') : [];
    usuarioEncontrado.roles_keys = usuarioEncontrado.roles_keys ? usuarioEncontrado.roles_keys.split(',') : [];

    // Generar JWT
    const token = jwt.sign(
      {
        id: usuarioEncontrado.id,
        nombre: usuarioEncontrado.nombre,
        mail: usuarioEncontrado.mail,
        roles_keys: usuarioEncontrado.roles_keys
      },
      SECRET_KEY,
      { expiresIn: '2h' }
    );

    // No devolver el hash al frontend
    delete usuarioEncontrado.contraseña;

    // Registrar login en SessionLog
    registrarSessionLog(usuarioEncontrado.id, 'login');

    res.json({ usuario: usuarioEncontrado, token });

  } catch (err) {
    console.error('Error al iniciar sesión:', err);
    res.status(500).json({ error: 'Error del servidor' });
  }
}; */

//Version sin hash
/* const login = async (req, res) => {
  const { usuario, password } = req.body;

  try {
    const pool = await poolPromise;

    const result = await pool.request()
      .input('usuario', sql.VarChar, usuario)
      .input('password', sql.VarChar, password)
      .query(`
        SELECT
          p.id,
          p.nombre,
          p.mail,
          p.tipo_usuario,
          g.Nombre AS grupo,
          STRING_AGG(r.Nombre, ',') AS roles,
          STRING_AGG(LOWER(REPLACE(r.Nombre, ' ', '')), ',') AS roles_keys
        FROM Persona p
        LEFT JOIN Grupo g ON p.GrupoId = g.Id
        LEFT JOIN Grupo_Rol gr ON g.Id = gr.GrupoId
        LEFT JOIN Rol r ON gr.RolId = r.Id
        WHERE p.mail = @usuario
          AND p.contraseña = @password
        GROUP BY p.id, p.nombre, p.mail, p.tipo_usuario, g.Nombre
      `);

    if (result.recordset.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const usuarioEncontrado = result.recordset[0];
    usuarioEncontrado.roles = usuarioEncontrado.roles ? usuarioEncontrado.roles.split(',') : [];
    usuarioEncontrado.roles_keys = usuarioEncontrado.roles_keys ? usuarioEncontrado.roles_keys.split(',') : [];

    // Generar JWT
    const token = jwt.sign(
      {
        id: usuarioEncontrado.id,
        nombre: usuarioEncontrado.nombre,
        mail: usuarioEncontrado.mail,
        roles_keys: usuarioEncontrado.roles_keys
      },
      SECRET_KEY,
      { expiresIn: '2h' }
    );

    res.json({ usuario: usuarioEncontrado, token });

  } catch (err) {
    console.error('Error al iniciar sesión:', err);
    res.status(500).json({ error: 'Error del servidor' });
  }
}; */

const cambiarPassword = async (req, res) => {
  const { email, oldPassword, newPassword } = req.body;
  let usuarioId = null;

  try {
    const pool = await poolPromise;

    // Obtener el usuario y su contraseña hasheada
    const result = await pool.request()
      .input('email', sql.VarChar, email)
      .query(`SELECT id, contraseña FROM Persona WHERE mail = @email`);

    if (result.recordset.length === 0) {
      return res.status(401).json({ mensaje: 'Credenciales inválidas.' });
    }

    const usuarioEncontrado = result.recordset[0];
    usuarioId = usuarioEncontrado.id;

    // Comparar la contraseña actual con el hash almacenado
    const passwordValida = await bcrypt.compare(oldPassword, usuarioEncontrado.contraseña);
    if (!passwordValida) {
      return res.status(401).json({ mensaje: 'Contraseña actual incorrecta.' });
    }

    // Hashear la nueva contraseña
    const nuevaContraseñaHash = await bcrypt.hash(newPassword, 10);

    // Actualizar la contraseña en la base de datos
    await pool.request()
      .input('id', sql.Int, usuarioEncontrado.id)
      .input('nuevaContraseñaHash', sql.VarChar, nuevaContraseñaHash)
      .query(`UPDATE Persona SET contraseña = @nuevaContraseñaHash WHERE id = @id`);

    //REGISTRAR ACCIÓN EN AUDITORÍA
    await registrarAuditoria(
        pool, 
        usuarioId, // Usuario Afectado (es el mismo que lo hace)
        usuarioId, // Usuario que Ejecuta la Acción (es el mismo)
        'PASSWORD_CHANGE', 
        'Cambio de contraseña realizado por el propio usuario',
        'contraseña',
        '***ANTERIOR_HASH_MODIFICADO***',
        '***NUEVO_HASH_MODIFICADO***' 
    );

    res.status(200).json({ mensaje: 'Contraseña cambiada exitosamente.' });

  } catch (err) {
    console.error('Error al cambiar la contraseña:', err);
    res.status(500).json({ error: 'Error del servidor' });
  }
};

const logout = async (req, res) => {
  try {
    const { id } = req.usuario; // lo obtenemos del middleware autenticarJWT

    await registrarSessionLog(id, "logout");

    res.json({ mensaje: 'Sesión cerrada correctamente' });
  } catch (err) {
    console.error('Error en logout:', err);
    res.status(500).json({ error: 'Error al cerrar sesión' });
  }
};


//Para crear reporte de Logs
const obtenerSessionLogs = async (req, res) => {
  const { fechaInicio, fechaFin } = req.query;

  try {
    const pool = await poolPromise;
    let query = `
      SELECT SL.Id, SL.PersonaId, P.Nombre, SL.AccionLog, SL.FechaHoraLog
      FROM SessionLog SL
      INNER JOIN Persona P ON SL.PersonaId = P.Id
      WHERE 1=1
    `;

    const request = pool.request();

    if (fechaInicio) {
      request.input("fechaInicio", sql.DateTime, new Date(`${fechaInicio}T00:00:00Z`));
      query += " AND SL.FechaHoraLog >= @fechaInicio";
    }
    if (fechaFin) {
      request.input("fechaFin", sql.DateTime, new Date(`${fechaFin}T23:59:59Z`));
      query += " AND SL.FechaHoraLog <= @fechaFin";
    }

    query += " ORDER BY SL.FechaHoraLog DESC";

    const result = await request.query(query);
    res.json(result.recordset);
  } catch (err) {
    console.error("Error obteniendo logs:", err.message);
    res.status(500).json({ error: "Error al obtener logs" });
  }
};


module.exports = { login, cambiarPassword, logout, obtenerSessionLogs };