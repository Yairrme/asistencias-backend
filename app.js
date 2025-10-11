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

// Importar rutas
const alumnosRoutes = require("./routes/alumnos");
const asistenciasRoutes = require("./routes/asistencias");
const clasesRoutes = require("./routes/clases");
const { router: authRoutes, verificarToken } = require("./routes/auth");

// Rutas públicas
app.use("/auth", authRoutes);


// Rutas protegidas
app.use("/alumnos", verificarToken, alumnosRoutes);
app.use("/asistencias", verificarToken, asistenciasRoutes);
app.use("/clases", verificarToken, clasesRoutes);


// Ruta raíz — muestra login.html
app.get("/", (req, res) => {
  res.redirect("/login.html");
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});