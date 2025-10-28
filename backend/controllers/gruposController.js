const { poolPromise, sql } = require('../db');

const getGrupos = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .query(`SELECT Id, Nombre FROM Grupo ORDER BY Nombre`);
    res.json(result.recordset);
  } catch (error) {
    console.error('Error al obtener grupos:', error);
    res.status(500).json({ error: 'Error al obtener grupos' });
  }
};

const createGrupo = async (req, res) => {
  const { nombre } = req.body;
  if (!nombre) return res.status(400).json({ error: 'El nombre es obligatorio' });

  try {
    const pool = await poolPromise;
    await pool.request()
      .input('nombre', sql.NVarChar(100), nombre)
      .query(`INSERT INTO Grupo (Nombre) VALUES (@nombre)`);
    res.status(201).json({ message: 'Grupo creado correctamente' });
  } catch (error) {
    console.error('Error al crear grupo:', error);
    if (error.originalError?.info?.number === 2627) {
      return res.status(400).json({ error: 'El nombre del grupo ya existe' });
    }
    res.status(500).json({ error: 'Error al crear el grupo' });
  }
};

// 1. Obtener Roles asignados a un Grupo (GET /api/grupos/:id/roles)
const getRolesPorGrupo = async (req, res) => {
    const { id } = req.params; // GrupoId

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('grupoId', sql.Int, id)
            .query(`
                SELECT GrupoId, RolId 
                FROM Grupo_Rol 
                WHERE GrupoId = @grupoId
            `);
        // Devuelve una lista de objetos {GrupoId: X, RolId: A}
        res.json(result.recordset); 
    } catch (error) {
        console.error('Error al obtener roles del grupo:', error);
        res.status(500).json({ error: 'Error al obtener roles del grupo' });
    }
};

// 2. Asignar/Sobrescribir Roles a un Grupo (POST /api/grupos/:id/roles)
const asignarRolesAGrupo = async (req, res) => {
    const { id } = req.params; // GrupoId
    const { rolesIds } = req.body; // Array de IDs de Roles: [1, 5, 8]

    if (!Array.isArray(rolesIds)) {
        return res.status(400).json({ error: 'El listado de roles es inválido' });
    }

    try {
        const pool = await poolPromise;
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            // Paso A: Eliminar todas las asignaciones existentes (para sobrescribir)
            await transaction.request()
                .input('grupoId', sql.Int, id)
                .query(`DELETE FROM Grupo_Rol WHERE GrupoId = @grupoId`);

            // Paso B: Insertar las nuevas asignaciones
            if (rolesIds.length > 0) {
                const request = transaction.request();
                const values = rolesIds.map((rolId, index) => {
                    request.input(`grupoId${index}`, sql.Int, id);
                    request.input(`rolId${index}`, sql.Int, rolId);
                    return `(@grupoId${index}, @rolId${index})`;
                }).join(', ');
                
                await request.query(`INSERT INTO Grupo_Rol (GrupoId, RolId) VALUES ${values}`);
            }

            await transaction.commit();
            res.status(200).json({ message: 'Roles asignados al grupo correctamente' });
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    } catch (error) {
        console.error('Error al asignar roles:', error);
        res.status(500).json({ error: 'Error al asignar roles' });
    }
};

module.exports = { 
    getGrupos, 
    createGrupo,
    getRolesPorGrupo,  
    asignarRolesAGrupo  
};

