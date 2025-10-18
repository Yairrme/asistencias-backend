import pool from '../config/db.js';

export async function getAllAsistencias(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT a.id, a.estado, a.fecha_registro,
              al.id AS alumno_id, al.nombre AS alumno_nombre, al.apellido AS alumno_apellido,
              c.id AS clase_id, c.fecha AS clase_fecha, m.nombre AS materia
       FROM asistencias a
       JOIN alumnos al ON a.alumno_id = al.id
       JOIN clases c ON a.clase_id = c.id
       LEFT JOIN materias m ON c.materia_id = m.id
       ORDER BY a.fecha_registro DESC`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

export async function getAsistenciasByAlumno(req, res, next) {
  try {
    const { alumnoId } = req.params;
    const [rows] = await pool.query(
      `SELECT a.id, a.estado, a.fecha_registro,
              c.id AS clase_id, c.fecha AS clase_fecha, m.nombre AS materia
       FROM asistencias a
       JOIN clases c ON a.clase_id = c.id
       LEFT JOIN materias m ON c.materia_id = m.id
       WHERE a.alumno_id = ?
       ORDER BY a.fecha_registro DESC`,
      [alumnoId]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

export async function createAsistencia(req, res, next) {
  try {
    const { fecha, estado, alumno_id, clase_id } = req.body;
    if (!estado || !alumno_id || !clase_id) {
      return res.status(400).json({ error: 'Faltan campos obligatorios: estado, alumno_id, clase_id' });
    }

    // Si envían fecha, la ignoramos en la inserción y usamos fecha_registro current_timestamp,
    // o podes guardar fecha en otra columna si tu modelo la tuviera.
    const [result] = await pool.query(
      'INSERT INTO asistencias (alumno_id, clase_id, estado) VALUES (?, ?, ?)',
      [alumno_id, clase_id, estado]
    );

    res.status(201).json({ message: 'Asistencia creada', asistenciaId: result.insertId });
  } catch (err) {
    next(err);
  }
}
