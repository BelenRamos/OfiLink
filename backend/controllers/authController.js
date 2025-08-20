const { poolPromise, sql } = require('../db');
const jwt = require('jsonwebtoken');
require('dotenv').config(); // leer .env
const SECRET_KEY = process.env.SECRET_KEY;

const login = async (req, res) => {
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

    // ✅ Generar JWT
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
};

module.exports = { login };
