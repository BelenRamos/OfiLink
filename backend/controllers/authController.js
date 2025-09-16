const { poolPromise, sql } = require('../db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config(); // leer .env
const SECRET_KEY = process.env.SECRET_KEY;

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
};

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