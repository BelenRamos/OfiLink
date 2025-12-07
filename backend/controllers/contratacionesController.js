const { MAX } = require('mssql');
const { poolPromise, sql } = require('../db');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const SECRET_KEY = process.env.SECRET_KEY;

const ESTADOS = {
  PENDIENTE: 1,
  ACEPTADA: 2,
  EN_CURSO: 3,
  FINALIZADA: 4,
  CANCELADA: 5,
  CADUCADA: 6,
};

// Middleware para verificar y decodificar el token --> No hace flata por el autenticarJWT
/* const verificarToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ error: 'Token no provisto' });

    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Token inválido' });

    const usuarioActual = jwt.verify(token, SECRET_KEY);
    //console.log("Usuario en token:", usuarioActual);
    req.usuario = usuarioActual; 
    next();
  } catch (error) {
    console.error('Error de token:', error);
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
}; */

// Obtener contrataciones
const getContrataciones = async (req, res) => {
  try {
    const { usuario } = req; 

    const roles = Array.isArray(usuario.roles_keys)
      ? usuario.roles_keys
      : [usuario.roles_keys];  // aseguro que siempre sea array

    const esTrabajador = roles.includes('trabajador');
    const esCliente = roles.includes('cliente');
    const esAdmin = roles.includes('administrador');
    const esSupervisor = roles.includes('supervisor');

    // Solo permitir a estos roles
    if (!esTrabajador && !esCliente && !esAdmin && !esSupervisor) {
      return res.status(403).json({ error: 'No autorizado' });
    }

    const pool = await poolPromise;
    const request = pool.request();

    let query = `
      SELECT 
          c.id, 
          pCliente.nombre AS cliente, 
          pTrabajador.nombre AS trabajador,
          t.id AS id_trabajador,
          ec.descripcion AS estado, 
          c.fecha_inicio, 
          c.fecha_fin, 
          c.descripcion_trabajo,
          r.id AS reseña_id
      FROM Contratacion c
      JOIN Cliente cl ON c.cliente_id = cl.id
      JOIN Persona pCliente ON cl.id = pCliente.id
      JOIN Trabajador t ON c.trabajador_id = t.id
      JOIN Persona pTrabajador ON t.id = pTrabajador.id
      JOIN EstadosContratacion ec ON c.estado_id = ec.id
      LEFT JOIN Reseña r ON c.id = r.contratacion_id
    `;

    // Filtrar según rol
    if (esCliente) {
      query += ` WHERE c.cliente_id = @idUsuario`;
      request.input('idUsuario', sql.Int, usuario.id);
    } else if (esTrabajador) {
      query += ` WHERE c.trabajador_id = @idUsuario`;
      request.input('idUsuario', sql.Int, usuario.id);
    }
    // Si es admin o supervisor => ve todas las contrataciones (sin WHERE)

    query += ` ORDER BY c.id DESC`;
    const result = await request.query(query);

    res.json(result.recordset);
  } catch (error) {
    console.error('Error al obtener contrataciones:', error);
    res.status(500).json({ error: 'Error al obtener contrataciones' });
  }
};

// Crear nueva contratación
const createContratacion = async (req, res) => {
  const { trabajador_id, fecha_inicio, descripcion_trabajo } = req.body;
  const { usuario } = req;

  if (!usuario.roles_keys?.includes('cliente')) {
    return res.status(403).json({ error: 'Solo los clientes pueden contratar' });
  }

  const cliente_id = usuario.id;

  try {
    const pool = await poolPromise;

    // Crear la contratación con estado PENDIENTE
    await pool.request()
      .input('cliente_id', sql.Int, cliente_id)
      .input('trabajador_id', sql.Int, trabajador_id)
      .input('estado_id', sql.Int, ESTADOS.PENDIENTE) 
      .input('descripcion_trabajo', sql.VarChar(MAX), descripcion_trabajo)
      .input('fecha_inicio', sql.Date, fecha_inicio || new Date())
      .query(`
        INSERT INTO Contratacion (cliente_id, trabajador_id, estado_id, fecha_inicio, descripcion_trabajo)
        VALUES (@cliente_id, @trabajador_id, @estado_id, @fecha_inicio, @descripcion_trabajo)
      `);

    res.status(201).json({ message: 'Contratación creada correctamente' });
  } catch (error) {
    console.error('Error al crear contratación:', error);
    res.status(500).json({ error: 'Error al crear la contratación' });
  }
};

// Manejar acciones de contrataciones (aceptar, terminar, cancelar)
const manejarAccionContratacion = async (req, res) => {
  const { id, accion } = req.params;
  const { usuario } = req;

  try {
    const pool = await poolPromise;

    // Obtener la contratación para validar permisos
    const contratacionRes = await pool.request()
      .input('id', sql.Int, id)
      .query(`SELECT * FROM Contratacion WHERE id = @id`);
    if (contratacionRes.recordset.length === 0) {
      return res.status(404).json({ error: 'Contratación no encontrada' });
    }

    const c = contratacionRes.recordset[0];
    const rolKeys = usuario.roles_keys;

    // Validaciones de permisos
    let nuevoEstadoId;
    let fechaFin = null;

    switch (accion) {
      case 'aceptar':
        if (!rolKeys.includes('trabajador') || usuario.id !== c.trabajador_id) {
          return res.status(403).json({ error: 'Solo el trabajador puede aceptar esta contratación.' });
        }
        if (c.estado_id !== ESTADOS.PENDIENTE) {
          return res.status(400).json({ error: 'No se puede aceptar una contratación que no está pendiente.' });
        }
        nuevoEstadoId = ESTADOS.ACEPTADA;
        break;

      case 'terminar':
        if (!rolKeys.includes('trabajador') || usuario.id !== c.trabajador_id) {
          return res.status(403).json({ error: 'Solo el trabajador puede finalizar esta contratación.' });
        }
        if (c.estado_id !== ESTADOS.EN_CURSO) {
          return res.status(400).json({ error: 'Solo se puede terminar una contratación en curso.' });
        }
        nuevoEstadoId = ESTADOS.FINALIZADA;
        fechaFin = new Date();
        break;

      case 'cancelar':
        // Puede ser cancelada por el cliente que la creó o por el trabajador asignado --> Restricciones?
        if (!((rolKeys.includes('cliente') && usuario.id === c.cliente_id) || (rolKeys.includes('trabajador') && usuario.id === c.trabajador_id))) {
          return res.status(403).json({ error: 'No puedes cancelar esta contratación' });
        }
        if (c.estado_id === ESTADOS.FINALIZADA || c.estado_id === ESTADOS.CANCELADA) {
           return res.status(400).json({ error: 'No se puede cancelar una contratación ya finalizada o cancelada.' });
        }
        nuevoEstadoId = ESTADOS.CANCELADA;
        fechaFin = new Date();
        break;

      default:
        return res.status(400).json({ error: 'Acción no válida' });
    }

    // Actualizar la contratación en la base de datos
    await pool.request()
      .input('id', sql.Int, id)
      .input('estado_id', sql.Int, nuevoEstadoId)
      .input('fecha_fin', sql.Date, fechaFin)
      .query(`
        UPDATE Contratacion
        SET estado_id = @estado_id,
            fecha_fin = @fecha_fin
        WHERE id = @id
      `);

    res.json({ message: `Contratación ${accion} correctamente` });
  } catch (error) {
    console.error('Error al manejar acción:', error);
    res.status(500).json({ error: 'Error al procesar la acción' });
  }
};

// Tarea CRON para actualizar contrataciones a 'En curso'
const updateContratacionesEnCurso = async () => {
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('estadoEnCurso', sql.Int, ESTADOS.EN_CURSO)
      .input('estadoAceptada', sql.Int, ESTADOS.ACEPTADA)
      .query(`
        UPDATE Contratacion
        SET estado_id = @estadoEnCurso
        WHERE estado_id = @estadoAceptada
          AND CAST(fecha_inicio AS DATE) <= CAST(GETDATE() AS DATE)
      `);
    console.log("Contrataciones actualizadas a 'En curso'");
  } catch (error) {
    console.error("Error al actualizar contrataciones en curso:", error);
  }
};

const updateContratacionesCaducadas = async () => {
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('estadoCaducada', sql.Int, ESTADOS.CADUCADA)
      .input('estadoPendiente', sql.Int, ESTADOS.PENDIENTE)
      .query(`
        UPDATE Contratacion
        SET estado_id = @estadoCaducada,
            fecha_fin = GETDATE()
        WHERE estado_id = @estadoPendiente
          AND CAST(fecha_inicio AS DATE) < CAST(GETDATE() AS DATE) 
      `);

    console.log("Contrataciones actualizadas a 'Caducadas' -- Se paso de la fecha propuesta");
  } catch (error) {
    console.error("Error al actualizar contrataciones caducadas:", error);
  }
};

module.exports = {
  getContrataciones,
  createContratacion,
  manejarAccionContratacion,
  updateContratacionesEnCurso,
  updateContratacionesCaducadas
};