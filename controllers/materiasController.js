import pool from "../config/db.js";

// ✅ Crear una nueva materia
export async function createMateria(req, res, next) {
  try {
    const { nombre, id_profesor } = req.body;

    if (!nombre || !id_profesor) {
      return res.status(400).json({
        error: "Faltan datos obligatorios: nombre e id_profesor",
      });
    }

    const [result] = await pool.query(
      "INSERT INTO materias (nombre, id_profesor) VALUES (?, ?)",
      [nombre, id_profesor]
    );

    res.status(201).json({
      message: "Materia creada correctamente",
      id_materia: result.insertId,
    });
  } catch (err) {
    console.error("Error creando materia:", err);
    next(err);
  }
}

// ✅ Obtener todas las materias
export async function getAllMaterias(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT m.id_materia, m.nombre, p.nombre AS profesor_nombre, p.apellido AS profesor_apellido
       FROM materias m
       LEFT JOIN profesores p ON m.id_profesor = p.id_profesor
       ORDER BY m.nombre ASC`
    );
    res.json(rows);
  } catch (err) {
    console.error("Error obteniendo materias:", err);
    next(err);
  }
}
