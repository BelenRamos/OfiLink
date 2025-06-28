const express = require('express');
const app = express();
const cors = require('cors');

// Middleware para parsear JSON y habilitar CORS
app.use(express.json());
app.use(cors());

// Rutas
const trabajadoresRouter = require('./routes/trabajadores'); // Ajustá si está en otra carpeta
app.use('/api/trabajadores', trabajadoresRouter);

// Si luego agregás rutas como clientes, contrataciones, etc.
  // const clientesRouter = require('./routes/clientes');
  // app.use('/api/clientes', clientesRouter);

// Puerto de escucha
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
});
