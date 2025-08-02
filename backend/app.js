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


// Puerto de escucha
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
});


