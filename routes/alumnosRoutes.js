import express from "express";
import { getAllAlumnos, asignarClaseAAlumno } from "../controllers/alumnosController.js";
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
      JOIN alumno_clase ac ON ac.id_alumno = a.id_alumno
      JOIN clase_materia cm ON cm.id_clase = ac.id_clase
      WHERE cm.id_materia = ?
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

// Asignar alumno a clase
router.post("/clase", asignarClaseAAlumno);

export default router;
