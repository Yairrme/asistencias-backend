import pool from '../config/db.js';

// Obtener todas las asistencias
export async function getAllAsistencias(req, res, next) {
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
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

// Obtener asistencias por alumno
export async function getAsistenciasByAlumno(req, res, next) {
  try {
    const { alumnoId } = req.params;
    const [rows] = await pool.query(
      `SELECT 
          a.id_asistencia AS id,
          a.presente AS estado,
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
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

// Registrar nueva asistencia
export async function createAsistencia(req, res, next) {
  try {
    const { id_alumno, id_materia, presente } = req.body;

    if (!id_alumno || !id_materia || presente === undefined) {
      return res.status(400).json({
        error: 'Faltan campos obligatorios: id_alumno, id_materia, presente'
      });
    }

    const [result] = await pool.query(
      'INSERT INTO asistencias (id_alumno, id_materia, presente) VALUES (?, ?, ?)',
      [id_alumno, id_materia, presente]
    );

    res.status(201).json({
      message: 'Asistencia registrada correctamente',
      asistenciaId: result.insertId
    });
  } catch (err) {
    next(err);
  }
}
