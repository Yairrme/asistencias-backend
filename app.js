import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Inicialización
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Variables para usar __dirname con ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
app.use(cors());
app.use(express.json());

// ✅ Servir archivos estáticos (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, "public")));

// Importar rutas del backend
import authRoutes from "./routes/authRoutes.js";
import alumnosRoutes from "./routes/alumnosRoutes.js";
import clasesRoutes from "./routes/clasesRoutes.js";
import asistenciasRoutes from "./routes/asistenciasRoutes.js";
import materiasRoutes from "./routes/materiasRoutes.js"; // ✅ agregado

// Usar rutas principales
app.use("/auth", authRoutes);
app.use("/alumnos", alumnosRoutes);
app.use("/clases", clasesRoutes);
app.use("/asistencias", asistenciasRoutes);
app.use("/materias", materiasRoutes); // ✅ nuevo endpoint

// ✅ Ruta principal → muestra el index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Middleware para manejar errores
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res
    .status(500)
    .json({ error: "Error interno del servidor", details: err.message });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
