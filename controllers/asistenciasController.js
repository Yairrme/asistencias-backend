import pool from "../config/db.js";

/**
 * ✅ Obtener todas las asistencias
 */
export async function getAllAsistencias(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT 
          a.id_asistencia AS id,
          a.presente AS estado,
          al.id_alumno AS alumno_id,
          al.nombre AS alumno_nombre,
          al.apellido AS alumno_apellido,
          m.id_materia AS materia_id,
          m.nombre AS materia,
          p.nombre AS profesor_nombre,
          p.apellido AS profesor_apellido
       FROM asistencias a
       JOIN alumnos al ON a.id_alumno = al.id_alumno
       JOIN materias m ON a.id_materia = m.id_materia
       LEFT JOIN profesores p ON m.id_profesor = p.id_profesor
       ORDER BY a.id_asistencia DESC`
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "No hay asistencias registradas" });
    }

    res.json(rows);
  } catch (err) {
    console.error("Error en getAllAsistencias:", err);
    res.status(500).json({
      error: "Error interno del servidor",
      details: err.message,
    });
  }
}

/**
 * ✅ Obtener asistencias por alumno
 */
export async function getAsistenciasByAlumno(req, res) {
  try {
    const { alumnoId } = req.params;

    if (!alumnoId || isNaN(alumnoId)) {
      return res.status(400).json({ error: "El parámetro alumnoId debe ser numérico" });
    }

    const [rows] = await pool.query(
      `SELECT 
  a.id_asistencia AS id,
  a.presente AS estado,
  a.fecha,
  m.id_materia AS materia_id,
  m.nombre AS materia,
  p.nombre AS profesor_nombre,
  p.apellido AS profesor_apellido
       FROM asistencias a
       JOIN materias m ON a.id_materia = m.id_materia
       LEFT JOIN profesores p ON m.id_profesor = p.id_profesor
       WHERE a.id_alumno = ?`,
      [alumnoId]
    );

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ message: "El alumno no tiene asistencias registradas" });
    }

    res.json(rows);
  } catch (err) {
    console.error("Error en getAsistenciasByAlumno:", err);
    res.status(500).json({
      error: "Error al obtener asistencias del alumno",
      details: err.message,
    });
  }
}

/**
 * ✅ Registrar nueva asistencia
 */
export async function createAsistencia(req, res) {
  try {
    const { id_alumno, id_materia, presente, fecha } = req.body;

    if (!id_alumno || !id_materia || typeof presente === "undefined") {
      return res.status(400).json({
        error: "Faltan campos obligatorios: id_alumno, id_materia, presente",
      });
    }

    const alumnoId = Number(id_alumno);
    const materiaId = Number(id_materia);
    const estado = Number(presente);

    // Validar existencia del alumno y materia
    const [[alumno]] = await pool.query(
      "SELECT id_alumno FROM alumnos WHERE id_alumno = ?",
      [alumnoId]
    );
    const [[materia]] = await pool.query(
      "SELECT id_materia FROM materias WHERE id_materia = ?",
      [materiaId]
    );

    if (!alumno || !materia) {
      return res
        .status(404)
        .json({ error: "Alumno o materia no encontrada en la base de datos" });
    }

  const [result] = await pool.query(
  `INSERT INTO asistencias (id_alumno, id_materia, presente, fecha)
   VALUES (?, ?, ?, ?)`,
  [alumnoId, materiaId, estado, fecha || new Date()]
);

    res.status(201).json({
      message: "Asistencia registrada correctamente ✅",
      asistenciaId: result.insertId,
    });
  } catch (err) {
    console.error("Error en createAsistencia:", err);
    res.status(500).json({
      error: "Error al registrar la asistencia",
      details: err.message,
    });
  }
}
