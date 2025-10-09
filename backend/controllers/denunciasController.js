const { poolPromise, sql } = require('../db');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const SECRET_KEY = process.env.SECRET_KEY;

// Middleware para verificar token 
const verificarToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ error: 'Token no provisto' });

    const token = authHeader.split(' ')[1];
    const usuarioActual = jwt.verify(token, SECRET_KEY);

    req.usuario = usuarioActual;
    next();
  } catch (error) {
    console.error('Error de token:', error);
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

const crearDenuncia = async (req, res) => {
  try {
    const { motivo, trabajador_id } = req.body;
    const { usuario } = req;

    if (!usuario.roles_keys?.includes('cliente')) {
      return res.status(403).json({ error: 'Solo los clientes pueden realizar denuncias.' });
    }

    if (!motivo || !trabajador_id) {
      return res.status(400).json({ error: 'Faltan datos: motivo o trabajador_id.' });
    }

    const pool = await poolPromise;
    await pool.request()
      .input('fecha', sql.Date, new Date())
      .input('motivo', sql.VarChar(sql.MAX), motivo)
      .input('cliente_id', sql.Int, usuario.id)
      .input('trabajador_id', sql.Int, trabajador_id)
      .query(`
        INSERT INTO Denuncia (fecha, motivo, cliente_id, trabajador_id)
        VALUES (@fecha, @motivo, @cliente_id, @trabajador_id)
      `);

    res.status(201).json({ mensaje: 'Denuncia registrada correctamente.' });
  } catch (error) {
    console.error('Error al crear denuncia:', error);
    res.status(500).json({ error: 'Error interno al registrar la denuncia.' });
  }
};

const obtenerDenuncias = async (req, res) => {
  try {
    const { usuario } = req;
    const pool = await poolPromise;
    const request = pool.request();

    let query = `
      SELECT 
        d.id, 
        d.fecha, 
        d.motivo,
        pCliente.nombre AS nombre_cliente,
        pTrabajador.nombre AS nombre_trabajador
      FROM Denuncia d
      JOIN Cliente c ON d.cliente_id = c.id
      JOIN Persona pCliente ON c.id = pCliente.id
      JOIN Trabajador t ON d.trabajador_id = t.id
      JOIN Persona pTrabajador ON t.id = pTrabajador.id
    `;

/*     //Si es cliente: solo sus denuncias
    if (usuario.roles_keys?.includes('cliente')) {
      query += ` WHERE d.cliente_id = @idUsuario`;
      request.input('idUsuario', sql.Int, usuario.id);
    } 
    //Si es trabajador: denuncias donde fue denunciado
    else if (usuario.roles_keys?.includes('trabajador')) {
      query += ` WHERE d.trabajador_id = @idUsuario`;
      request.input('idUsuario', sql.Int, usuario.id);
    } */

    //Si es administrador: ve todas
    query += ` ORDER BY d.fecha DESC`;

    const result = await request.query(query);
    res.json(result.recordset);
  } catch (error) {
    console.error('Error al obtener denuncias:', error);
    res.status(500).json({ error: 'Error al obtener denuncias.' });
  }
};


module.exports = { 
    verificarToken, 
    crearDenuncia, 
    obtenerDenuncias,
    };
