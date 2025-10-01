const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 3000;

app.use(cors()); // permite llamadas desde tu frontend
app.use(express.json()); // para leer JSON

// Importar rutas
const alumnosRoutes = require("./routes/alumnos");
const asistenciasRoutes = require("./routes/asistencias");
const clasesRoutes = require("./routes/clases");

// Usar rutas
app.use("/alumnos", alumnosRoutes);
app.use("/asistencias", asistenciasRoutes);
app.use("/clases", clasesRoutes);

// Servidor corriendo
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});