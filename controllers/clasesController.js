import pool from '../config/db.js';

export async function getAllClases(req, res, next) {
  try {
    // devolvemos info de clase + nombre de materia
    const [rows] = await pool.query(
      `SELECT c.id, c.fecha, c.materia_id, m.nombre AS materia_nombre
       FROM clases c
       LEFT JOIN materias m ON c.materia_id = m.id
       ORDER BY c.fecha DESC`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
}
