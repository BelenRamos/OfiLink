const { poolPromise, sql } = require('../db');

const login = async (req, res) => {
  const { usuario, password } = req.body;

  try {
    const pool = await poolPromise;

    const result = await pool.request()
      .input('usuario', sql.VarChar, usuario)
      .input('password', sql.VarChar, password)
      .query(`
        SELECT 
          p.id, p.nombre, p.mail,
          CASE 
            WHEN EXISTS (SELECT 1 FROM Trabajador t WHERE t.id = p.id) THEN 'trabajador'
            WHEN EXISTS (SELECT 1 FROM Cliente c WHERE c.id = p.id) THEN 'cliente'
            ELSE 'otro'
          END AS tipo
        FROM Persona p
        WHERE p.mail = @usuario AND contraseña = @password
      `);

    if (result.recordset.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const usuarioEncontrado = result.recordset[0];
    res.json(usuarioEncontrado);
  } catch (err) {
    console.error('Error al iniciar sesión:', err);
    res.status(500).json({ error: 'Error del servidor' });
  }
};

module.exports = { login };
