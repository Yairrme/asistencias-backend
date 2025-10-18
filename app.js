const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();
require("dotenv").config();
const PORT = 3000;

app.use(cors()); // permite llamadas desde tu frontend
app.use(express.json()); // para leer JSON

// Servir archivos estáticos desde la carpeta "public"
app.use(express.static(path.join(__dirname, "public")));

// --- CAMBIOS AQUÍ ---

// 1. Importar rutas (ya no se importa verificarToken)
const alumnosRoutes = require("./routes/alumnos");
const asistenciasRoutes = require("./routes/Asistencias");
const clasesRoutes = require("./routes/clases");
// Se importa solo el router desde auth.js
const authRoutes = require("./routes/auth"); 

// 2. Usar las rutas (ahora todas son públicas)
app.use("/auth", authRoutes);
app.use("/alumnos", alumnosRoutes);
app.use("/asistencias", asistenciasRoutes);
app.use("/clases", clasesRoutes);

// --- FIN DE LOS CAMBIOS ---

// Ruta raíz — muestra login.html
app.get("/", (req, res) => {
  res.redirect("/login.html");
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});