import express from "express";
import cors from "cors";
import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();

import authRoutes from "./routes/authRoutes.js";
import alumnosRoutes from "./routes/alumnosRoutes.js";
import clasesRoutes from "./routes/clasesRoutes.js";
import asistenciasRoutes from "./routes/asistenciasRoutes.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Rutas principales
app.use("/auth", authRoutes);
app.use("/alumnos", alumnosRoutes);
app.use("/clases", clasesRoutes);
app.use("/asistencias", asistenciasRoutes);

// Ruta base
app.get("/", (req, res) => {
  res.json({ message: "Asistencias Backend funcionando correctamente ✅" });
});

// Middleware para manejar errores
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ error: "Error interno del servidor", details: err.message });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
