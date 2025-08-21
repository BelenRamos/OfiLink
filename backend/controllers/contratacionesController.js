const { MAX } = require('mssql');
const { poolPromise, sql } = require('../db');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const SECRET_KEY = process.env.SECRET_KEY;

// Obtener contrataciones (sin cambio)
const getContrataciones = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .query(`
        SELECT c.id, pCliente.nombre AS cliente, pTrabajador.nombre AS trabajador,
               ec.descripcion AS estado, c.fecha_inicio, c.fecha_fin, c.descripcion_trabajo
        FROM Contratacion c
        JOIN Cliente cl ON c.cliente_id = cl.id
        JOIN Persona pCliente ON cl.id = pCliente.id
        JOIN Trabajador t ON c.trabajador_id = t.id
        JOIN Persona pTrabajador ON t.id = pTrabajador.id
        JOIN EstadosContratacion ec ON c.estado_id = ec.id
        ORDER BY c.id DESC
      `);
    res.json(result.recordset);
  } catch (error) {
    console.error('Error al obtener contrataciones:', error);
    res.status(500).json({ error: 'Error al obtener contrataciones' });
  }
};

// Crear nueva contratación usando JWT
const createContratacion = async (req, res) => {
  console.log('Cuerpo de la petición recibido:', req.body);
  const { trabajador_id, fecha_inicio, descripcion_trabajo} = req.body;

  try {
    // Leer token del header Authorization
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ error: 'Token no provisto' });

    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Token inválido' });

    const usuarioActual = jwt.verify(token, SECRET_KEY);

    if (!usuarioActual.roles_keys?.includes('cliente')) {
      return res.status(403).json({ error: 'Solo los clientes pueden contratar' });
    }

    const cliente_id = usuarioActual.id;

    const pool = await poolPromise;

    // Estado inicial: Aceptada
    const estadoResult = await pool.request()
      .query(`SELECT id FROM EstadosContratacion WHERE id = 1`);
    if (estadoResult.recordset.length === 0) {
      return res.status(400).json({ error: 'No existe estado inicial para la contratación' });
    }
    const estado_id = estadoResult.recordset[0].id;

    await pool.request()
      .input('cliente_id', sql.Int, cliente_id)
      .input('trabajador_id', sql.Int, trabajador_id)
      .input('estado_id', sql.Int, estado_id)
      .input('descripcion_trabajo', sql.VarChar(MAX), descripcion_trabajo)
      .input('fecha_inicio', sql.Date, fecha_inicio || new Date())
      .query(`
        INSERT INTO Contratacion (cliente_id, trabajador_id, estado_id, fecha_inicio, descripcion_trabajo)
        VALUES (@cliente_id, @trabajador_id, @estado_id, @fecha_inicio, @descripcion_trabajo)
      `);

    res.status(201).json({ message: 'Contratación creada correctamente' });
  } catch (error) {
    console.error('Error al crear contratación:', error);
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

module.exports = {
  getContrataciones,
  createContratacion
};
