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
    isAdmin
};
