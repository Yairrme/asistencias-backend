import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Rutas
import authRoutes from "./routes/authRoutes.js";
import alumnosRoutes from "./routes/alumnosRoutes.js";
import clasesRoutes from "./routes/clasesRoutes.js";
import asistenciasRoutes from "./routes/asistenciasRoutes.js";
import materiasRoutes from "./routes/materiasRoutes.js";

// Inicialización
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Variables para usar __dirname con ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
app.use(cors());
app.use(express.json()); // 👈 Necesario para parsear JSON en requests POST/PUT

// Servir archivos estáticos (por ejemplo un index.html)
app.use(express.static(path.join(__dirname, "public")));

// Rutas principales
app.use("/api/auth", authRoutes);
app.use("/api/alumnos", alumnosRoutes);
app.use("/api/clases", clasesRoutes);
app.use("/api/asistencias", asistenciasRoutes);
app.use("/api/materias", materiasRoutes);

// Ruta base
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({
    error: "Error interno del servidor",
    details: err.message,
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
