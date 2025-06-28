const express = require('express');
const app = express();

const trabajadoresRouter = require('./routes/trabajadores'); // Ajusta la ruta si hace falta

app.use('/api/trabajadores', trabajadoresRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor escuchando en puerto ${PORT}`));
