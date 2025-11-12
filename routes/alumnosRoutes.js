import express from "express";
import { getAllAlumnos } from "../controllers/alumnosController.js";
import db from "../config/db.js"; // usa el mismo nombre que en otras rutas

const router = express.Router();

// Obtener alumnos por materia
router.get("/por-materia/:materiaId", async (req, res, next) => {
  const { materiaId } = req.params;

  // Validación básica
  if (!materiaId || isNaN(materiaId)) {
    return res.status(400).json({ error: "El parámetro materiaId debe ser numérico" });
  }

  try {
    const [alumnos] = await db.query(
      `
      SELECT DISTINCT a.id_alumno, a.nombre, a.apellido
      FROM alumnos a
      JOIN alumno_materia am ON am.id_alumno = a.id_alumno
      WHERE am.id_materia = ?
      `,
      [materiaId]
    );

    if (alumnos.length === 0) {
      return res.status(404).json({ message: "No se encontraron alumnos para esta materia" });
    }

    res.json(alumnos);
  } catch (err) {
    console.error("Error al obtener alumnos por materia:", err);
    res.status(500).json({ error: "Error al consultar alumnos por materia" });
  }
});

// Asignar alumno a materia
router.post("/asignar", async (req, res) => {
  try {
    const { id_alumno, id_materia } = req.body;

    if (!id_alumno || !id_materia) {
      return res.status(400).json({ error: "Faltan datos (id_alumno o id_materia)" });
    }

    // Podés tener una tabla específica: alumno_materia
    await db.query(
      "INSERT INTO alumno_materia (id_alumno, id_materia) VALUES (?, ?)",
      [id_alumno, id_materia]
    );

    res.json({ message: "Alumno asignado correctamente a la materia" });
  } catch (err) {
    console.error("Error al asignar alumno a materia:", err);
    res.status(500).json({ error: "Error al asignar alumno a materia" });
  }
});

// Obtener todos los alumnos
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT id_alumno, nombre, apellido FROM alumnos");
    res.json(rows);
  } catch (err) {
    console.error("Error al obtener alumnos:", err);
    res.status(500).json({ error: "Error al obtener alumnos" });
  }
});

export default router;
