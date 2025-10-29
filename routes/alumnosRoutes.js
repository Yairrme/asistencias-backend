import express from "express";
import { getAllAlumnos, asignarClaseAAlumno } from "../controllers/alumnosController.js";
import pool from "../config/db.js";

const router = express.Router();

// Obtener alumnos por materia
router.get("/por-materia/:materiaId", async (req, res, next) => {
  const { materiaId } = req.params;

  try {
    const [alumnos] = await pool.query(
      `SELECT DISTINCT a.id_alumno, a.nombre, a.apellido
       FROM alumnos a
       JOIN alumno_clase ac ON ac.id_alumno = a.id_alumno
       JOIN clase_materia cm ON cm.id_clase = ac.id_clase
       WHERE cm.id_materia = ?`,
      [materiaId]
    );

    res.json(alumnos);
  } catch (err) {
    console.error("Error al obtener alumnos por materia:", err);
    next(err);
  }
});

// Asignar alumno a clase
router.post("/clase", asignarClaseAAlumno);

export default router;