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

/* =========================================================
   🔧 PATCH — ACTUALIZAR SOLO "presente"
   ========================================================= */
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

/* =========================================================
   📌 GET — Asistencias por materia (AGRUPADAS POR FECHA)
   ========================================================= */
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
      let fechaVal;

      if (row.fecha instanceof Date) {
        fechaVal = row.fecha.toISOString().split("T")[0];
      } else {
        fechaVal = String(row.fecha).split("T")[0];
      }

      if (!acc[fechaVal]) acc[fechaVal] = [];

      acc[fechaVal].push({
        id_asistencia: row.id_asistencia,   // ← NECESARIO PARA EDITAR
        id_alumno: row.id_alumno,
        nombre: row.alumno_nombre,
        apellido: row.alumno_apellido,
        presente: row.presente,
      });

      return acc;
    }, {});

    // Convertir a array para el frontend
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


/* =========================================================
   🔒 PUT — Edición segura SOLO PARA PROFESOR DE ESA MATERIA
   ========================================================= */
router.put("/:id_asistencia", async (req, res) => {
  const { id_asistencia } = req.params;
  const { presente, id_profesor } = req.body;

  if (typeof presente === "undefined" || typeof id_profesor === "undefined") {
    return res.status(400).json({ 
      error: "Faltan campos: 'presente' e 'id_profesor' son obligatorios." 
    });
  }

  try {
    // 1) Verifico existencia de la asistencia y obtengo id_materia
    const [rowsAsis] = await db.query(
      "SELECT id_materia FROM asistencias WHERE id_asistencia = ?",
      [id_asistencia]
    );

    if (!rowsAsis.length) {
      return res.status(404).json({ error: "Asistencia no encontrada." });
    }

    const id_materia = rowsAsis[0].id_materia;

    // 2) Verifico que la materia pertenezca al profesor
    const [rowsMat] = await db.query(
      "SELECT id_profesor FROM materias WHERE id_materia = ?",
      [id_materia]
    );

    if (!rowsMat.length) {
      return res.status(404).json({ error: "Materia no encontrada." });
    }

    if (Number(rowsMat[0].id_profesor) !== Number(id_profesor)) {
      return res.status(403).json({
        error: "No tienes permiso para editar esta asistencia.",
      });
    }

    // 3) Actualizo la asistencia
    const [result] = await db.query(
      "UPDATE asistencias SET presente = ? WHERE id_asistencia = ?",
      [Number(presente), id_asistencia]
    );

    if (result.affectedRows === 0) {
      return res.status(500).json({ error: "No se actualizó ninguna fila." });
    }

    res.json({ mensaje: "Asistencia actualizada correctamente." });
  } catch (err) {
    console.error("ERROR PUT /api/asistencias/:id_asistencia ->", err);
    res.status(500).json({ 
      error: "Error interno al actualizar asistencia", 
      details: err.message 
    });
  }
});

export default router;
