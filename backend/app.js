const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path'); 

//CRON --> Para la actualizacion de estado de contratacion
const cron = require('node-cron');
const { updateContratacionesEnCurso, updateContratacionesCaducadas } = require('./controllers/contratacionesController');
const { updateSolicitudesCaducadas} = require('./controllers/solicitudesController');
const { desbloquearCuentasVencidas } = require('./controllers/personasController');

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

const solicitudesRoutes = require('./routes/solicitudes');
app.use('/api/solicitudes', solicitudesRoutes);

const denunciasRoutes = require('./routes/denuncias');
app.use('/api/denuncias', denunciasRoutes);

//Seguridad
const rolesRoutes = require('./routes/seguridad/roles');
app.use('/api/roles', rolesRoutes);

const permisosRoutes = require('./routes/seguridad/permisos.js');
app.use('/api/permisos', permisosRoutes);

const gruposRoutes = require('./routes/seguridad/grupos.js');
app.use('/api/grupos', gruposRoutes);

const asignacionesRoutes = require('./routes/seguridad/asignaciones.js');
app.use('/api/asignaciones', asignacionesRoutes);

const zonasRoutes = require('./routes/zonas');
app.use('/api/zonas', zonasRoutes);

const oficiosRoutes = require('./routes/oficios');
app.use('/api/oficios', oficiosRoutes);

const estadisticasRoutes = require('./routes/seguridad/estadisticas');
app.use('/api/estadisticas', estadisticasRoutes);

const auditoriasRoutes = require('./routes/seguridad/auditorias');
app.use('/api/auditorias', auditoriasRoutes);

//Foto de perfil

const PERSONAS_UPLOADS_PATH = path.join(__dirname, 'uploads', 'personas');
const FOTO_UPLOADS_PATH = path.join(__dirname, 'uploads', 'personas'); 
app.use('/uploads/personas', express.static(FOTO_UPLOADS_PATH)); 

// Se ejecuta cada 30 minutos
cron.schedule('*/5 * * * *', () => {
  console.log("⏳ Revisando contrataciones...");
  updateContratacionesEnCurso();
  updateContratacionesCaducadas();
});

// Se ejecuta cada 30 minutos
cron.schedule('*/5 * * * *', () => {
  console.log("⏳ Revisando contrataciones...");
    updateSolicitudesCaducadas();
});

// Se ejecuta cada día a la medianoche
// cron.schedule('0 0 * * *', () => {
cron.schedule('*/2 * * * *', () => {  
  console.log("Verificando bloqueos vencidos...");
  desbloquearCuentasVencidas();
});


// Puerto de escucha
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
});


