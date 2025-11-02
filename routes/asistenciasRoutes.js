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

// Actualizar asistencia (solo el campo "presente")
router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { presente } = req.body;

  try {
    if (typeof presente === "undefined") {
      return res.status(400).json({
        error: "Debe enviar el campo 'presente' (0 = ausente, 1 = presente)",
      });
    }

    const query = `
      UPDATE asistencias 
      SET presente = ?
      WHERE id_asistencia = ?;
    `;
    const [result] = await db.query(query, [Number(presente), id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Asistencia no encontrada" });
    }

    res.json({ message: "Asistencia actualizada correctamente ✅" });
  } catch (error) {
    console.error("Error al actualizar asistencia:", error);
    res.status(500).json({ error: "Error al actualizar asistencia" });
  }
});

export default router;
