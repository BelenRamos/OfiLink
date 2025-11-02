const { poolPromise, sql } = require('../db');

// --- 1. OBTENER PERSONAS Y SU GRUPO ASIGNADO ---
const getPersonasConGrupo = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .query(`
        SELECT 
          p.Id, 
          p.Nombre AS PersonaNombre, 
          p.Mail,
          p.GrupoId,
          g.Nombre AS GrupoNombre
        FROM Persona p
        LEFT JOIN Grupo g ON p.GrupoId = g.Id
        ORDER BY p.Nombre
      `);
    res.json(result.recordset);
  } catch (error) {
    console.error('Error al obtener personas y grupos:', error);
    res.status(500).json({ error: 'Error al obtener personas y grupos' });
  }
};

// --- 2. OBTENER LISTA DE GRUPOS DISPONIBLES ---
const getGruposDisponibles = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .query(`SELECT Id, Nombre FROM Grupo ORDER BY Nombre`);
    res.json(result.recordset);
  } catch (error) {
    console.error('Error al obtener grupos disponibles:', error);
    res.status(500).json({ error: 'Error al obtener grupos disponibles' });
  }
};


// --- 3. ASIGNAR GRUPO A UNA PERSONA (ACTUALIZAR Persona.GrupoId) ---
const asignarGrupoAPersona = async (req, res) => {
  const { personaId, grupoId } = req.body; // grupoId puede ser null para desasignar

  // El ID de persona es obligatorio
  if (!personaId) {
    return res.status(400).json({ error: 'El ID de persona es obligatorio.' });
  }

  // Convertir grupoId a null si viene como cadena vacía o undefined
  const finalGrupoId = grupoId === '' || grupoId === undefined || grupoId === null ? null : parseInt(grupoId);

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('personaId', sql.Int, personaId)
      .input('grupoId', sql.Int, finalGrupoId)
      .query(`
        UPDATE Persona
        SET GrupoId = @grupoId
        WHERE Id = @personaId
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Persona no encontrada.' });
    }

    res.status(200).json({ message: `Grupo ${finalGrupoId ? 'asignado' : 'desasignado'} correctamente a la persona.` });
  } catch (error) {
    console.error('Error al asignar grupo a persona:', error);
    if (error.message.includes('FOREIGN KEY constraint')) {
        return res.status(400).json({ error: 'El GrupoId proporcionado no existe.' });
    }
    res.status(500).json({ error: 'Error interno al asignar el grupo.' });
  }
};

module.exports = { 
    getPersonasConGrupo, 
    getGruposDisponibles,
    asignarGrupoAPersona 
};