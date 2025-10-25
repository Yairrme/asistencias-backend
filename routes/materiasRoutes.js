import express from "express";
import pool from "../config/db.js"; // Asegurate de importar pool
import { createMateria, getAllMaterias } from "../controllers/materiasController.js";

const router = express.Router();

// Crear materia
router.post("/", createMateria);

// Obtener todas las materias
router.get("/", getAllMaterias);

// GET /materias/por-alumno/:alumnoId
router.get("/por-alumno/:alumnoId", async (req, res, next) => {
  const { alumnoId } = req.params;
  try {
    const [materias] = await pool.query(
      `SELECT DISTINCT m.id_materia, m.nombre
       FROM materias m
       JOIN clase_materia cm ON cm.id_materia = m.id_materia
       JOIN alumno_clase ac ON ac.id_clase = cm.id_clase
       WHERE ac.id_alumno = ?`,
      [alumnoId]
    );

    res.json(materias);
  } catch (err) {
    console.error("Error al obtener materias del alumno:", err);
    next(err);
  }
});

export default router;