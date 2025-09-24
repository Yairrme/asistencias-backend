const express = require('express');
const cors = require('cors');
const app = express();
const asistenciasRoutes = require('./routes/Asistencias');


app.use(cors());
app.use(express.json());

// Rutas
app.use('/asistencias', asistenciasRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
