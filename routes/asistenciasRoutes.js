import express from "express";
import {
  getAllAsistencias,
  getAsistenciasByAlumno,
  createAsistencia,
} from "../controllers/asistenciasController.js";
import db from "../config/db.js";

const router = express.Router();

// Obtener todas las asistencias
router.get("/", getAllAsistencias);

// Obtener asistencias por alumno
router.get("/por-alumno/:alumnoId", getAsistenciasByAlumno);

// Registrar una nueva asistencia
router.post("/", createAsistencia);

// Actualizar asistencia (marcar error o cambiar estado)
router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { estado, observacion } = req.body;

  try {
    const query = `
      UPDATE asistencias 
      SET estado = ?, observacion = ?
      WHERE id = ?;
    `;
    await db.query(query, [estado, observacion || null, id]);
    res.json({ message: "Asistencia actualizada correctamente ✅" });
  } catch (error) {
    console.error("Error al actualizar asistencia:", error);
    res.status(500).json({ error: "Error al actualizar asistencia" });
  }
});

export default router;
