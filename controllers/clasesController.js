import pool from "../config/db.js";

// Devuelve clases + nombre de materia + profesor_id (para el front)
export async function getAllClases(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT 
         c.id,
         c.fecha,
         c.materia_id,
         m.nombre AS materia,
         m.profesor_id
       FROM clases c
       LEFT JOIN materias m ON c.materia_id = m.id
       ORDER BY c.fecha DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error("Error en getAllClases:", err);
    res.status(500).json({ error: "Error interno del servidor", details: err.message });
  }
}

// 🔹 Obtener materias de un profesor
export async function getMateriasPorProfesor(req, res, next) {
  try {
    const { profesorId } = req.params;
    const [rows] = await pool.query(
      "SELECT id, nombre, profesor_id FROM materias WHERE profesor_id = ?",
      [profesorId]
    );
    res.json(rows);
  } catch (err) {
    console.error("Error en getMateriasPorProfesor:", err);
    res.status(500).json({ error: "Error interno del servidor", details: err.message });
  }
}
