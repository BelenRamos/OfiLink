// controllers/contratacionesController.js
const { poolPromise, sql } = require('../db');

const getContrataciones = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .query(`
        SELECT c.id, pCliente.nombre AS cliente, pTrabajador.nombre AS trabajador,
               ec.descripcion AS estado, c.fecha_inicio, c.fecha_fin
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

const createContratacion = async (req, res) => {
  const { trabajador_id, fecha_inicio } = req.body;

  // Obtener usuario actual desde sesión
  const usuarioActual = req.session?.usuarioActual;
  if (!usuarioActual) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  if (!usuarioActual.roles_keys?.includes('cliente')) {
    return res.status(403).json({ error: 'Solo los clientes pueden contratar' });
  }

  try {
    const cliente_id = usuarioActual.id; // mismo id que en Persona y Cliente

    const pool = await poolPromise;

    // Buscar estado inicial de contratación
    const estadoResult = await pool.request()
      .query(`SELECT id FROM EstadosContratacion WHERE descripcion = 'Aceptada'`);
    if (estadoResult.recordset.length === 0) {
      return res.status(400).json({ error: 'No existe estado inicial para la contratación' });
    }
    const estado_id = estadoResult.recordset[0].id;

    await pool.request()
      .input('cliente_id', sql.Int, cliente_id)
      .input('trabajador_id', sql.Int, trabajador_id)
      .input('estado_id', sql.Int, estado_id)
      .input('fecha_inicio', sql.Date, fecha_inicio || new Date())
      .query(`
        INSERT INTO Contratacion (cliente_id, trabajador_id, estado_id, fecha_inicio)
        VALUES (@cliente_id, @trabajador_id, @estado_id, @fecha_inicio)
      `);

    res.status(201).json({ message: 'Contratación creada correctamente' });
  } catch (error) {
    console.error('Error al crear contratación:', error);
    res.status(500).json({ error: 'Error al crear contratación' });
  }
};

module.exports = {
  getContrataciones,
  createContratacion
};
