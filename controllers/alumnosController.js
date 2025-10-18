import pool from '../config/db.js';

export async function getAllAlumnos(req, res, next) {
  try {
    const [rows] = await pool.query('SELECT * FROM alumnos');
    res.json(rows);
  } catch (err) {
    next(err);
  }
}
