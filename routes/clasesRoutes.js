import express from "express";
import {
  getAllClases,
  getMateriasPorProfesor,
  createClase,
  asignarMateriaAClase
} from "../controllers/clasesController.js";

const router = express.Router();

router.get("/", getAllClases);
router.post("/", createClase);
router.get("/por-profesor/:profesorId", getMateriasPorProfesor); // Obtener materias de un profesor específico

// Obtener clases por materia
router.get("/por-materia/:materiaId", async (req, res, next) => {
  const { materiaId } = req.params;
  try {
    const [clases] = await pool.query(
      `SELECT c.id_clase, c.fecha
       FROM clases c
       JOIN clase_materia cm ON cm.id_clase = c.id_clase
       WHERE cm.id_materia = ?`,
      [materiaId]
    );

    res.json(clases);
  } catch (err) {
    console.error("Error al obtener clases por materia:", err);
    next(err);
  }
});

export default router;