const express = require('express');
const app = express();
const cors = require('cors');

// Middleware para parsear JSON y habilitar CORS 49753
app.use(express.json());
app.use(cors());

// Rutas
const trabajadoresRouter = require('./routes/trabajadores'); 
app.use('/api/trabajadores', trabajadoresRouter);

const resenasRouter = require('./routes/resenas');
app.use('/api/resenas', resenasRouter);

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const personasRoutes = require('./routes/personas.js');
app.use('/api/personas', personasRoutes);

const contratacionesRoutes = require('./routes/contrataciones');
app.use('/api/contrataciones', contratacionesRoutes);

//Seguridad
const rolesRoutes = require('./routes/seguridad/roles');
app.use('/api/roles', rolesRoutes);

const permisosRoutes = require('./routes/seguridad/permisos.js');
app.use('/api/permisos', permisosRoutes);

const gruposRoutes = require('./routes/seguridad/grupos.js');
app.use('/api/grupos', gruposRoutes);

const asignacionesRoutes = require('./routes/seguridad/asignaciones.js');
app.use('/api/asignaciones', asignacionesRoutes);


// Puerto de escucha
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
});


