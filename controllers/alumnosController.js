import pool from '../config/db.js';

export async function getAllAlumnos(req, res, next) {
  try {
    const { materia } = req.query;

    // Si no piden filtrar por materia, devolvemos todos
    if (!materia) {
      const [rows] = await pool.query('SELECT * FROM alumnos');
      return res.json(rows);
    }

    // Si hay materia, devolvemos los alumnos que ya tienen al menos una asistencia en esa materia
    // (con el modelo actual no hay tabla de inscripciones; esto es lo más cercano)
    const [rows] = await pool.query(
      `SELECT DISTINCT a.*
       FROM alumnos a
       JOIN asistencias s ON s.alumno_id = a.id
       JOIN clases c ON c.id = s.clase_id
       WHERE c.materia_id = ?`,
      [materia]
    );

    res.json(rows);
  } catch (err) {
    next(err);
  }
}
