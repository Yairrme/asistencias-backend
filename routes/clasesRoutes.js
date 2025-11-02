import express from "express";
import {
  getAllClases,
  getMateriasPorProfesor,
  createClase,
  asignarMateriaAClase,
} from "../controllers/clasesController.js";
import pool from "../config/db.js"; // 🔹 te faltaba importar el pool

const router = express.Router();

// Obtener todas las clases
router.get("/", getAllClases);

// Crear una nueva clase
router.post("/", createClase);

// Obtener materias de un profesor específico
router.get("/por-profesor/:profesorId", getMateriasPorProfesor);

// Obtener clases por materia (corregido: sin columna "fecha")
router.get("/por-materia/:materiaId", async (req, res) => {
  const { materiaId } = req.params;

  try {
    const [clases] = await pool.query(
      `
      SELECT c.id_clase, c.nombre, c.anio
      FROM clases c
      JOIN clase_materia cm ON cm.id_clase = c.id_clase
      WHERE cm.id_materia = ?
      `,
      [materiaId]
    );

    if (clases.length === 0) {
      return res
        .status(404)
        .json({ message: "No se encontraron clases para esta materia" });
    }

    res.json(clases);
  } catch (err) {
    console.error("Error al obtener clases por materia:", err);
    res
      .status(500)
      .json({ error: "Error al obtener clases por materia", details: err.message });
  }
});

export default router;
