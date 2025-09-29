const { MAX } = require('mssql');
const { poolPromise, sql } = require('../db');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const SECRET_KEY = process.env.SECRET_KEY;

const ESTADOS_SOLICITUD = {
  ABIERTA: 1,
  TOMADA: 2,
  CERRADA: 3,
  CANCELADA: 4,
};

const oficioSubQuery = `
    (
        SELECT STRING_AGG(o.nombre, ', ') 
        FROM Solicitud_Oficio so
        JOIN Oficio o ON so.oficio_id = o.id
        WHERE so.solicitud_id = s.id
    )
`;

// Cuando se tome una solictud, se crea la contratacion con estado tomada, y se actualizara cuando llegue la fecha tentaiva
const ESTADO_CONTRATACION_TOMADA = 2; 

// Middleware para verificar y decodificar el token
const verificarToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ error: 'Token no provisto' });

    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Token inválido' });

    const usuarioActual = jwt.verify(token, SECRET_KEY);
    req.usuario = usuarioActual;
    next();
  } catch (error) {
    console.error('Error de token:', error);
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
};


const getSolicitudesTrabajador = async (req, res) => {
    try {
        const { usuario } = req;

        if (!usuario.roles_keys?.includes('trabajador')) {
            return res.status(403).json({ error: 'No autorizado' });
        }

        const pool = await poolPromise;
        const request = pool.request();
        request.input('trabajador_id', sql.Int, usuario.id);
        request.input('estadoAbierta', sql.Int, ESTADOS_SOLICITUD.ABIERTA);

        // Muestra solicitudes ABIERTAS que coincidan con AL MENOS UN oficio del trabajador
        const query = `
            SELECT DISTINCT 
                s.id, 
                s.descripcion_trabajo, 
                s.fecha, 
                es.descripcion AS estado, 
                c.nombre AS cliente,
                ${oficioSubQuery} AS oficios_requeridos
            FROM Solicitud s
            JOIN EstadosSolicitud es ON s.estado_id = es.id
            JOIN Cliente cl ON s.cliente_id = cl.id
            JOIN Persona c ON cl.id = c.id
            JOIN Solicitud_Oficio so ON s.id = so.solicitud_id
            JOIN Trabajador_Oficio tofi ON so.oficio_id = tofi.oficio_id AND tofi.trabajador_id = @trabajador_id
            WHERE s.estado_id = @estadoAbierta
            ORDER BY s.id DESC
        `;

        const result = await request.query(query);

        res.json(result.recordset);
    } catch (error) {
        console.error('Error al obtener solicitudes trabajador:', error);
        res.status(500).json({ error: 'Error al obtener solicitudes' });
    }
};

const getSolicitudesCliente = async (req, res) => {
    try {
        const { usuario } = req;

        if (!usuario.roles_keys?.includes('cliente')) {
            return res.status(403).json({ error: 'No autorizado' });
        }

        const pool = await poolPromise;
        const result = await pool.request()
            .input('cliente_id', sql.Int, usuario.id)
            .query(`
                SELECT 
                    s.id, 
                    s.descripcion_trabajo, 
                    s.fecha, 
                    es.descripcion AS estado,
                    ${oficioSubQuery} AS oficios_requeridos
                FROM Solicitud s
                JOIN EstadosSolicitud es ON s.estado_id = es.id
                WHERE s.cliente_id = @cliente_id
                ORDER BY s.id DESC
            `);

        res.json(result.recordset);
    } catch (error) {
        console.error('Error al obtener solicitudes cliente:', error);
        res.status(500).json({ error: 'Error al obtener solicitudes' });
    }
};

const createSolicitud = async (req, res) => {
  const { descripcion_trabajo, fecha, oficios } = req.body;
  const { usuario } = req;

  if (!usuario.roles_keys?.includes('cliente')) {
    return res.status(403).json({ error: 'Solo clientes pueden crear solicitudes' });
  }

  const pool = await poolPromise;
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    const solicitudResult = await transaction.request()
      .input('cliente_id', sql.Int, usuario.id)
      .input('descripcion_trabajo', sql.VarChar(sql.MAX), descripcion_trabajo)
      .input('fecha', sql.Date, fecha || new Date())
      .input('estado_id', sql.Int, ESTADOS_SOLICITUD.ABIERTA)
      .query(`
        INSERT INTO Solicitud (cliente_id, descripcion_trabajo, fecha, estado_id)
        OUTPUT INSERTED.id
        VALUES (@cliente_id, @descripcion_trabajo, @fecha, @estado_id)
      `);

    const solicitudId = solicitudResult.recordset[0].id;

    if (Array.isArray(oficios) && oficios.length > 0) {
      for (let oficioId of oficios) {
        await transaction.request()
          .input('solicitud_id', sql.Int, solicitudId)
          .input('oficio_id', sql.Int, oficioId)
          .query(`INSERT INTO Solicitud_Oficio (solicitud_id, oficio_id) VALUES (@solicitud_id, @oficio_id)`);
      }
    }

    await transaction.commit();
    res.status(201).json({ message: 'Solicitud creada exitosamente', solicitudId });

  } catch (error) {
    await transaction.rollback();
    console.error('Error al crear solicitud (rollback):', error);
    res.status(500).json({ error: 'Error al crear solicitud. La operación fue deshecha.' });
  }
};

const cancelarSolicitud = async (req, res) => {
  try {
    const { usuario } = req;
    const { id } = req.params;

    const pool = await poolPromise;

    // Verificar que la solicitud existe
    const solicitud = await pool.request()
      .input('id', sql.Int, id)
      .query(`SELECT cliente_id, estado_id FROM Solicitud WHERE id = @id`);

    if (solicitud.recordset.length === 0) {
      return res.status(404).json({ error: 'Solicitud no encontrada' });
    }

    const s = solicitud.recordset[0];

    // Restricción: Solo el cliente que la creó puede cancelarla
    if (usuario.roles_keys?.includes('cliente') && usuario.id !== s.cliente_id) {
      return res.status(403).json({ error: 'No tienes permiso para cancelar esta solicitud' });
    }
    
    // Si no es cliente, asume que es un administrador/supervisor que puede cancelar
    const puedeCancelar = usuario.roles_keys?.includes('administrador') || usuario.roles_keys?.includes('supervisor');
    if (!usuario.roles_keys?.includes('cliente') && !puedeCancelar) {
        return res.status(403).json({ error: 'No autorizado para cancelar solicitudes' });
    }

    if (s.estado_id === ESTADOS_SOLICITUD.CERRADA || s.estado_id === ESTADOS_SOLICITUD.CANCELADA) {
      return res.status(400).json({ error: 'No se puede cancelar una solicitud cerrada o ya cancelada' });
    }

    await pool.request()
      .input('id', sql.Int, id)
      .input('estado_id', sql.Int, ESTADOS_SOLICITUD.CANCELADA)
      .query(`UPDATE Solicitud SET estado_id = @estado_id WHERE id = @id`);

    res.json({ message: 'Solicitud cancelada correctamente' });
  } catch (error) {
    console.error('Error al cancelar solicitud:', error);
    res.status(500).json({ error: 'Error al cancelar solicitud' });
  }
};

const tomarSolicitud = async (req, res) => {
  const { id } = req.params;
  const { usuario } = req;
  const pool = await poolPromise;
  const transaction = new sql.Transaction(pool);

  if (!usuario.roles_keys?.includes('trabajador')) {
    return res.status(403).json({ error: 'Solo trabajadores pueden tomar solicitudes' });
  }

  try {
    await transaction.begin();

    const solicitudRes = await transaction.request()
      .input('id', sql.Int, id)
      .query(`SELECT cliente_id, descripcion_trabajo FROM Solicitud WITH (UPDLOCK) WHERE id = @id AND estado_id = ${ESTADOS_SOLICITUD.ABIERTA}`); 
      // Se añade WITH (UPDLOCK) para evitar que dos trabajadores la tomen a la vez.

    if (solicitudRes.recordset.length === 0) {
      await transaction.rollback();
      return res.status(400).json({ error: 'Solicitud no encontrada o no está disponible (estado ABIERTA)' });
    }

    const solicitud = solicitudRes.recordset[0];
    const trabajadorId = usuario.id;

    //Cambiar estado de solicitud a TOMADA 
    await transaction.request()
      .input('id', sql.Int, id)
      .input('estado_id', sql.Int, ESTADOS_SOLICITUD.TOMADA)
      .query(`UPDATE Solicitud SET estado_id = @estado_id WHERE id = @id`);

    //Crear contratación automáticamente en estado TOMADA --> Viene de la constante de arriba
    const contratacionResult = await transaction.request()
      .input('cliente_id', sql.Int, solicitud.cliente_id)
      .input('trabajador_id', sql.Int, trabajadorId)
      .input('estado_id', sql.Int, ESTADO_CONTRATACION_TOMADA) 
      .input('descripcion_trabajo', sql.VarChar(sql.MAX), solicitud.descripcion_trabajo)
      .input('fecha_inicio', sql.Date, new Date())
      .query(`
        INSERT INTO Contratacion (cliente_id, trabajador_id, estado_id, fecha_inicio, descripcion_trabajo)
        OUTPUT INSERTED.id
        VALUES (@cliente_id, @trabajador_id, @estado_id, @fecha_inicio, @descripcion_trabajo)
      `);
      
    const contratacionId = contratacionResult.recordset[0].id;

    await transaction.commit();
    res.json({ message: 'Solicitud tomada y contratación creada en curso', contratacionId });
  } catch (error) {
    await transaction.rollback();
    console.error('Error al tomar solicitud (rollback):', error);
    res.status(500).json({ error: 'Error al tomar solicitud' });
  }
};

module.exports = {
  verificarToken,
  getSolicitudesCliente,
  getSolicitudesTrabajador,
  createSolicitud,
  cancelarSolicitud,
  tomarSolicitud
};