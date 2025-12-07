const { poolPromise, sql } = require('../db');

const getHistorialAuditoria = async (req, res) => {
    const { fechaInicio, fechaFin } = req.query; 
    
    try {
        const pool = await poolPromise;
        const request = pool.request();

        let query = `
            SELECT 
                A.Id, 
                A.FechaHora,
                A.TipoCambio,
                A.Observaciones,
                A.ColumnaAfectada,
                A.ValorAnterior,
                A.ValorNuevo,
                P_AFECTADO.nombre AS persona_afectada_nombre,
                A.PersonaId AS persona_afectada_id,
                P_ACCION.nombre AS usuario_accion_nombre,
                A.UsuarioAccionId AS usuario_accion_id
            FROM 
                Auditoria_Persona A
            INNER JOIN 
                Persona P_AFECTADO ON A.PersonaId = P_AFECTADO.id
            INNER JOIN 
                Persona P_ACCION ON A.UsuarioAccionId = P_ACCION.id
        `;
        
        // Filtro de fechas
        if (fechaInicio || fechaFin) {
            query += ` WHERE 1=1 `; // Punto de partida para encadenar condiciones
            
            if (fechaInicio) {
                // Se usa >= para incluir el inicio del día
                query += ` AND A.FechaHora >= @fechaInicio `;
                // Se usa sql.DateTime para manejar el formato de fecha correctamente
                request.input('fechaInicio', sql.DateTime, new Date(fechaInicio)); 
            }
            
            if (fechaFin) {
                // Para incluir todo el día de fin: sumamos 1 día y se usa <
                const dateFin = new Date(fechaFin);
                dateFin.setDate(dateFin.getDate() + 1); // Sumar un día
                query += ` AND A.FechaHora < @fechaFinMasUnoDia `; 
                request.input('fechaFinMasUnoDia', sql.DateTime, dateFin);
            }
        }

        query += ` ORDER BY A.FechaHora DESC; `; // Ordenar siempre al final

        const result = await request.query(query);
        res.json(result.recordset);

    } catch (err) {
        console.error('Error al obtener el historial de auditoría con filtro:', err);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

module.exports = {
    getHistorialAuditoria,
};
