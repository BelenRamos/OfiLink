const { poolPromise, sql } = require('../db');

const getHistorialAuditoria = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT 
                A.Id, 
                A.FechaHora,             
                A.TipoCambio,  
                A.Observaciones,  
                A.ColumnaAfectada,  
                A.ValorAnterior,   
                A.ValorNuevo,  
                -- Usuario afectado (Persona Afectada)
                P_AFECTADO.nombre AS persona_afectada_nombre,
                A.PersonaId AS persona_afectada_id,  
                -- Usuario que realiza la acción
                P_ACCION.nombre AS usuario_accion_nombre,
                A.UsuarioAccionId AS usuario_accion_id 
            FROM 
                Auditoria_Persona A
            INNER JOIN 
                Persona P_AFECTADO ON A.PersonaId = P_AFECTADO.id 
            INNER JOIN 
                Persona P_ACCION ON A.UsuarioAccionId = P_ACCION.id
            ORDER BY 
                A.FechaHora DESC; 
        `);

        res.json(result.recordset);

    } catch (err) {
        console.error('Error al obtener el historial de auditoría:', err);
        res.status(500).json({ error: 'Error interno del servidor al obtener la auditoría.' });
    }
};

module.exports = {
    getHistorialAuditoria,
    
};