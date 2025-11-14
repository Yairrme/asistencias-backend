import express from "express";
import {
  getAllAsistencias,
  getAsistenciasByAlumno,
  createAsistencia,
  updateAsistencia,
  getEstadisticasPorMateria,
} from "../controllers/asistenciasController.js";
import db from "../config/db.js";

const router = express.Router();

// Obtener todas las asistencias
router.get("/", getAllAsistencias);

// Obtener asistencias por alumno
router.get("/por-alumno/:alumnoId", getAsistenciasByAlumno);

// Estadísticas por materia (controller)
router.get("/estadisticas/:materiaId", getEstadisticasPorMateria);

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

// ✅ Obtener asistencias por materia (agrupadas por fecha)
router.get("/por-materia/:materiaId", async (req, res) => {
  const { materiaId } = req.params;

  try {
    const [rows] = await db.query(
      `SELECT 
        a.id_asistencia,
        a.fecha,
        a.presente,
        al.id_alumno,
        al.nombre AS alumno_nombre,
        al.apellido AS alumno_apellido
      FROM asistencias a
      JOIN alumnos al ON a.id_alumno = al.id_alumno
      WHERE a.id_materia = ?
      ORDER BY a.fecha DESC, al.apellido ASC`,
      [materiaId]
    );

    if (rows.length === 0) {
      return res.json([]);
    }

    // Agrupar asistencias por fecha
    const agrupado = rows.reduce((acc, row) => {
      // row.fecha puede venir como Date o como string; manejamos ambos casos
      let fechaVal;
      if (row.fecha instanceof Date) {
        fechaVal = row.fecha.toISOString().split("T")[0];
      } else if (row.fecha) {
        // si viene "YYYY-MM-DD" o similar, dejamos la parte de fecha
        fechaVal = String(row.fecha).split("T")[0];
      } else {
        fechaVal = "Sin fecha";
      }

      if (!acc[fechaVal]) acc[fechaVal] = [];
      acc[fechaVal].push({
        id_alumno: row.id_alumno,
        nombre: row.alumno_nombre,
        apellido: row.alumno_apellido,
        presente: row.presente,
      });
      return acc;
    }, {});

    // Convertir a array
    const resultado = Object.entries(agrupado).map(([fecha, alumnos]) => ({
      fecha,
      alumnos,
    }));

    res.json(resultado);
  } catch (error) {
    console.error("Error al obtener historial por materia:", error);
    res.status(500).json({ error: "Error al obtener historial de asistencias" });
  }
});

export default router;
