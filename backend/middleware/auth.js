const jwt = require('jsonwebtoken');
require('dotenv').config();
const SECRET_KEY = process.env.SECRET_KEY;

const autenticarJWT = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ error: 'No token' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.usuario = decoded; // guardamos info del usuario en req
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};

// --------------------------------------------------------
// MIDDLEWARE DE PERMISOS
// --------------------------------------------------------
const requirePermission = (...permisosRequeridos) => {
    // Retorna la función middleware de Express
    return (req, res, next) => {
        // 1. Verificar autenticación (aunque 'autenticarJWT' debería preceder a esto)
        if (!req.usuario) {
            return res.status(401).json({ error: 'No autorizado. Autenticación requerida.' });
        }

        const permisosUsuario = req.usuario.permisos_keys || [];

        // 2. Verificar si el usuario tiene TODOS los permisos requeridos
        // Opcionalmente, puedes cambiar a .some() si quieres que baste con TENER AL MENOS UNO.
        // Pero típicamente, requirePermission requiere que se cumplan TODOS.
        const tieneTodosLosPermisos = permisosRequeridos.every(permiso => 
            permisosUsuario.includes(permiso)
        );

        if (tieneTodosLosPermisos) {
            next();
        } else {
            // Loguear (opcional) o devolver error específico
            console.warn(`Intento de acceso denegado a usuario ID ${req.usuario.id || 'N/A'}. Permisos faltantes: ${permisosRequeridos.filter(p => !permisosUsuario.includes(p)).join(', ')}`);
            return res.status(403).json({ 
                error: 'Acceso denegado. Permisos insuficientes.',
                detalles: `Se requieren los permisos: [${permisosRequeridos.join(', ')}]`
            });
        }
    };
};
// --------------------------------------------------------


const isAdmin = (req, res, next) => {
    // Implementación: Verifica si req.usuario.GrupoId es 1 (o el ID de administrador)
    if (req.usuario && req.usuario.GrupoId === 1) { 
        next();
    } else {
        res.status(403).json({ error: 'Acceso denegado: Se requiere rol de administrador' });
    }
};


module.exports = { 
    autenticarJWT, 
    isAdmin,
    requirePermission 
};