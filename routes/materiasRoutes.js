import express from "express";
import pool from "../config/db.js";
import { createMateria, getAllMaterias } from "../controllers/materiasController.js";

const router = express.Router();

// Crear materia
router.post("/", createMateria);

// Obtener todas las materias
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT id_materia, nombre FROM materias");
    res.json(rows);
  } catch (err) {
    console.error("Error al obtener materias:", err);
    res.status(500).json({ error: "Error al obtener materias" });
  }
});

// Obtener materias por alumno (usa la tabla alumno_materia)
router.get("/por-alumno/:alumnoId", async (req, res) => {
  const { alumnoId } = req.params;

  if (!alumnoId || isNaN(alumnoId)) {
    return res.status(400).json({ error: "El parámetro alumnoId debe ser numérico" });
  }

  try {
    const [materias] = await pool.query(
      `
      SELECT DISTINCT m.id_materia, m.nombre
      FROM materias m
      JOIN alumno_materia am ON am.id_materia = m.id_materia
      WHERE am.id_alumno = ?
      `,
      [alumnoId]
    );

    if (materias.length === 0) {
      return res.status(404).json({ message: "No se encontraron materias para este alumno" });
    }

    res.json(materias);
  } catch (err) {
    console.error("Error al obtener materias del alumno:", err);
    res.status(500).json({ error: "Error al obtener materias del alumno" });
  }
});

// Obtener materias por profesor
router.get("/por-profesor/:profesorId", async (req, res) => {
  const { profesorId } = req.params;

  if (!profesorId || isNaN(profesorId)) {
    return res.status(400).json({ error: "El parámetro profesorId debe ser numérico" });
  }

  try {
    const [materias] = await pool.query(
      `
      SELECT m.id_materia, m.nombre
      FROM materias m
      WHERE m.id_profesor = ?
      `,
      [profesorId]
    );

    if (materias.length === 0) {
      return res.status(404).json({ message: "No se encontraron materias para este profesor" });
    }

    res.json(materias);
  } catch (err) {
    console.error("Error al obtener materias del profesor:", err);
    res.status(500).json({ error: "Error al obtener materias del profesor" });
  }
});

export default router;
