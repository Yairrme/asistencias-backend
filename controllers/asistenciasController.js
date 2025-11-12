import pool from "../config/db.js";

export async function getAllAsistencias(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT 
        a.id_asistencia AS id,
        a.presente AS presente,
        al.id_alumno AS alumno_id,
        al.nombre AS alumno_nombre,
        al.apellido AS alumno_apellido,
        m.id_materia AS materia_id,
        m.nombre AS materia,
        a.fecha
       FROM asistencias a
       JOIN alumnos al ON a.id_alumno = al.id_alumno
       LEFT JOIN materias m ON a.id_materia = m.id_materia
       ORDER BY a.id_asistencia DESC`
    );

    res.json(rows);
  } catch (err) {
    next(err);
  }
}

export async function getAsistenciasByAlumno(req, res, next) {
  try {
    const { alumnoId } = req.params;
    if (!alumnoId || isNaN(alumnoId)) return res.status(400).json({ error: 'alumnoId inválido' });

    const [rows] = await pool.query(
      `SELECT a.id_asistencia AS id, a.presente AS presente, a.fecha, m.id_materia AS materia_id, m.nombre AS materia
       FROM asistencias a
       LEFT JOIN materias m ON a.id_materia = m.id_materia
       WHERE a.id_alumno = ?
       ORDER BY a.id_asistencia DESC`,
      [alumnoId]
    );

    res.json(rows);
  } catch (err) {
    next(err);
  }
}

export async function getAsistenciasByMateria(req, res, next) {
  try {
    const { materiaId } = req.params;
    const { fecha } = req.query; // opcional YYYY-MM-DD

    if (!materiaId || isNaN(materiaId)) return res.status(400).json({ error: 'materiaId inválido' });

    const qFecha = fecha || new Date().toISOString().slice(0,10);

    const [rows] = await pool.query(
      `SELECT id_asistencia AS id, id_alumno, presente, DATE(fecha) AS fecha
       FROM asistencias
       WHERE id_materia = ? AND DATE(fecha) = ?`,
      [Number(materiaId), qFecha]
    );

    res.json(rows);
  } catch (err) {
    next(err);
  }
}

export async function createAsistencia(req, res, next) {
  try {
    const { alumno_id, id_alumno, id_materia, presente, fecha } = req.body;

    // Aceptar variantes de atributos
    const alumnoId = alumno_id || id_alumno;
    const materiaId = id_materia || null;
    const estado = typeof presente !== 'undefined' ? Number(presente) : null;

    // Validaciones mínimas: alumno, materia y presente
    if (!alumnoId || materiaId === null || estado === null) {
      return res.status(400).json({ error: 'Faltan campos: alumno_id, id_materia, presente' });
    }

    // Insertar en la tabla usando id_materia
    const insertQuery = `INSERT INTO asistencias (id_alumno, id_materia, presente, fecha) VALUES (?, ?, ?, ?)`;
    const insertParams = [Number(alumnoId), Number(materiaId), Number(estado), fecha || new Date()];

    const [result] = await pool.query(insertQuery, insertParams);

    res.status(201).json({ message: 'Asistencia registrada', asistenciaId: result.insertId });
  } catch (err) {
    next(err);
  }
}

export async function updateAsistencia(req, res, next) {
  try {
    const { id } = req.params;
    const { estado, presente } = req.body;
    const nuevoValor = typeof presente !== 'undefined' ? presente : estado;

    if (typeof nuevoValor === 'undefined') return res.status(400).json({ error: 'Falta campo presente/estado' });

    const [result] = await pool.query('UPDATE asistencias SET presente = ? WHERE id_asistencia = ?', [Number(nuevoValor), Number(id)]);

    if (result.affectedRows === 0) return res.status(404).json({ message: 'Asistencia no encontrada' });

    res.json({ message: 'Asistencia actualizada' });
  } catch (err) {
    next(err);
  }
}
