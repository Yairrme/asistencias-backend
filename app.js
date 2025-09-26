const express = require('express');
const cors = require('cors');
const app = express();
app.use(express.static('public'));

const clasesRoutes = require('./routes/clases');
app.use('/clases', clasesRoutes);



const asistenciasRoutes = require('./routes/asistencias'); // en minúsculas
const alumnosRoutes = require('./routes/alumnos');

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use('/alumnos', alumnosRoutes);
app.use('/asistencias', asistenciasRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
