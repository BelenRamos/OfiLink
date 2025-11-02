const { poolPromise, sql } = require('../db');

const getPermisos = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .query(`
        SELECT Id, Nombre, Descripcion, PadreId 
        FROM Permiso
        ORDER BY Nombre
      `);
    // Opcional: Procesar a formato de árbol aquí o dejarlo para el frontend
    res.json(result.recordset); 
  } catch (error) {
    console.error('Error al obtener permisos:', error);
    res.status(500).json({ error: 'Error al obtener permisos' });
  }
};

const createPermiso = async (req, res) => {
  const { nombre, descripcion, padreId } = req.body;
  if (!nombre) return res.status(400).json({ error: 'El nombre es obligatorio' });

  try {
    const pool = await poolPromise;
    await pool.request()
      .input('nombre', sql.NVarChar(100), nombre)
      .input('descripcion', sql.NVarChar(255), descripcion || null)
      .input('padreId', sql.Int, padreId || null)
      .query(`
        INSERT INTO Permiso (Nombre, Descripcion, PadreId)
        VALUES (@nombre, @descripcion, @padreId)
      `);
    res.status(201).json({ message: 'Permiso creado correctamente' });
  } catch (error) {
    console.error('Error al crear permiso:', error);
    if (error.originalError?.info?.number === 2627) {
      return res.status(400).json({ error: 'El nombre del permiso ya existe' });
    }
    res.status(500).json({ error: 'Error al crear el permiso' });
  }
};

const updatePermiso = async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, padreId } = req.body;
  if (!nombre) return res.status(400).json({ error: 'El nombre es obligatorio' });

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .input('nombre', sql.NVarChar(100), nombre)
      .input('descripcion', sql.NVarChar(255), descripcion || null)
      .input('padreId', sql.Int, padreId || null)
      .query(`
        UPDATE Permiso 
        SET Nombre = @nombre, Descripcion = @descripcion, PadreId = @padreId
        WHERE Id = @id
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Permiso no encontrado' });
    }
    res.status(200).json({ message: 'Permiso actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar permiso:', error);
    if (error.originalError?.info?.number === 2627) {
      return res.status(400).json({ error: 'El nombre del permiso ya existe' });
    }
    // Evitar ciclos infinitos en PadreId (Autoreferencia)
    if (error.message.includes('FK_Permiso_Padre')) { 
       return res.status(400).json({ error: 'ID de padre no válido o el permiso padre no existe.' });
    }
    res.status(500).json({ error: 'Error al actualizar el permiso' });
  }
};

const deletePermiso = async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
      // 1. Verificar si tiene permisos hijos
      const hijosCheck = await transaction.request()
        .input('id', sql.Int, id)
        .query(`SELECT COUNT(*) as count FROM Permiso WHERE PadreId = @id`);
      
      if (hijosCheck.recordset[0].count > 0) {
        await transaction.rollback();
        return res.status(409).json({ error: 'No se puede eliminar el permiso porque tiene permisos hijos asociados. Reasígnelos primero.' });
      }

      // 2. Eliminar referencias en las tablas de relación
      await transaction.request().input('id', sql.Int, id).query(`DELETE FROM Rol_Permiso WHERE PermisoId = @id`);
      await transaction.request().input('id', sql.Int, id).query(`DELETE FROM Formulario_Permiso WHERE PermisoId = @id`);
      await transaction.request().input('id', sql.Int, id).query(`DELETE FROM Componente_Permiso WHERE PermisoId = @id`);

      // 3. Eliminar el Permiso
      const result = await transaction.request()
        .input('id', sql.Int, id)
        .query(`DELETE FROM Permiso WHERE Id = @id`);

      if (result.rowsAffected[0] === 0) {
        await transaction.rollback();
        return res.status(404).json({ error: 'Permiso no encontrado' });
      }

      await transaction.commit();
      res.status(200).json({ message: 'Permiso eliminado correctamente' });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Error al eliminar permiso:', error.message);
    res.status(500).json({ error: 'Error al eliminar el permiso' });
  }
};


module.exports = { 
    getPermisos, 
    createPermiso,
    updatePermiso,
    deletePermiso 
};