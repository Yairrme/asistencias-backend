import express from "express";
import {
  getAllAsistencias,
  getAsistenciasByAlumno,
  createAsistencia,
  updateAsistencia,
} from "../controllers/asistenciasController.js";
import db from "../config/db.js";

const router = express.Router();

// Obtener todas las asistencias
router.get("/", getAllAsistencias);

// Obtener asistencias por alumno
router.get("/por-alumno/:alumnoId", getAsistenciasByAlumno);
// Añadir mapping a controlador (si se prefiere usar controller en vez de inline)
import { getAsistenciasByMateria } from "../controllers/asistenciasController.js";
router.get('/materia/:materiaId', getAsistenciasByMateria);

// Obtener asistencias por materia (opcional ?fecha=YYYY-MM-DD)
router.get("/por-materia/:materiaId", async (req, res) => {
  const { materiaId } = req.params;
  const { fecha } = req.query; // formato YYYY-MM-DD opcional

  if (!materiaId || isNaN(materiaId)) {
    return res.status(400).json({ error: 'materiaId inválido' });
  }

  try {
    const qFecha = fecha || new Date().toISOString().slice(0,10);
    const query = `
      SELECT id_asistencia AS id, id_alumno, presente, DATE(fecha) AS fecha
      FROM asistencias
      WHERE id_materia = ? AND DATE(fecha) = ?
    `;
    const [rows] = await db.query(query, [Number(materiaId), qFecha]);
    res.json(rows);
  } catch (err) {
    console.error('Error al obtener asistencias por materia:', err);
    res.status(500).json({ error: 'Error al obtener asistencias por materia' });
  }
});

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

// Aceptar PUT que también actualiza el campo 'presente'
router.put('/:id', updateAsistencia);

export default router;
