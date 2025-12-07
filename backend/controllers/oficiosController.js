const { poolPromise, sql } = require('../db');

// Obtener todos los oficios
const getOficios = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT Id, Nombre, Descripcion
      FROM Oficio
      ORDER BY Nombre
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error("Error al obtener oficios:", err);
    res.status(500).json({ error: "Error del servidor" });
  }
};

// Crear un nuevo oficio
const createOficio = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    const pool = await poolPromise;

    await pool.request()
      .input('nombre', sql.VarChar(100), nombre)
      .input('descripcion', sql.VarChar(sql.MAX), descripcion)
      .query(`
        INSERT INTO Oficio (Nombre, Descripcion)
        VALUES (@nombre, @descripcion)
      `);

    res.status(201).json({ message: 'Oficio creado correctamente' });
  } catch (err) {
    console.error("Error al crear oficio:", err);
    res.status(500).json({ error: "Error del servidor" });
  }
};

// Actualizar un oficio
const updateOficio = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;
    const pool = await poolPromise;

    const result = await pool.request()
      .input('id', sql.Int, id)
      .input('nombre', sql.VarChar(100), nombre)
      .input('descripcion', sql.VarChar(sql.MAX), descripcion)
      .query(`
        UPDATE Oficio
        SET Nombre = @nombre, Descripcion = @descripcion
        WHERE Id = @id
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Oficio no encontrado' });
    }

    res.json({ message: 'Oficio actualizado correctamente' });
  } catch (err) {
    console.error("Error al actualizar oficio:", err);
    res.status(500).json({ error: "Error del servidor" });
  }
};

// Eliminar un oficio
const deleteOficio = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await poolPromise; 

    // 1. VERIFICACIÓN DE INTEGRIDAD EN Solicitud_Oficio (La tabla sin ON DELETE CASCADE)
    // --------------------------------------------------------------------------------
    const solicitudCheck = await pool.request()
        .input('id', id)
        .query(`SELECT COUNT(*) AS count FROM Solicitud_Oficio WHERE oficio_id = @id`);
        
    const solicitudesCount = solicitudCheck.recordset[0].count;

    if (solicitudesCount > 0) {
        // 🛑 BLOQUEA LA ELIMINACIÓN
        return res.status(409).json({ // Código 409 Conflict
            error: `No se puede eliminar el oficio porque está asociado a ${solicitudesCount} solicitud(es).`,
            details: "Considere eliminar las solicitudes asociadas o desvincular el oficio antes de intentar eliminarlo."
        });
    }
    // --------------------------------------------------------------------------------

    // 2. PROCEDER A ELIMINAR EL OFICIO
    //    * Trabajador_Oficio se limpia automáticamente gracias a ON DELETE CASCADE.
    const result = await pool.request()
      .input('id', id)
      .query(`DELETE FROM Oficio WHERE Id = @id`); // La eliminación real ocurre aquí

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: "Oficio no encontrado." });
    }

    res.json({ message: "Oficio eliminado con éxito." });

  } catch (err) {
    console.error("Error al eliminar oficio:", err);
    res.status(500).json({ error: "Error del servidor" });
  }
};

module.exports = {
  getOficios,
  createOficio,
  updateOficio,
  deleteOficio
};
