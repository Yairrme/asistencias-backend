import pool from "../config/db.js";

/**
 * ✅ Crear una nueva materia
 */
export async function createMateria(req, res) {
  try {
    const { nombre, id_profesor } = req.body;
    console.log("📦 Datos recibidos:", req.body);


    if (!nombre || !id_profesor) {
      return res.status(400).json({
        error: "Faltan datos obligatorios: nombre e id_profesor",
      });
    }

    if (isNaN(id_profesor)) {
      return res.status(400).json({ error: "El id_profesor debe ser numérico" });
    }

    // Verificar que el profesor exista
    const [profesor] = await pool.query(
      "SELECT id_profesor FROM profesores WHERE id_profesor = ?",
      [id_profesor]
    );

    if (profesor.length === 0) {
      return res.status(404).json({
        error: "El profesor indicado no existe en la base de datos",
      });
    }

    const [result] = await pool.query(
      "INSERT INTO materias (nombre, id_profesor) VALUES (?, ?)",
      [nombre, id_profesor]
    );

    res.status(201).json({
      message: "Materia creada correctamente ✅",
      id_materia: result.insertId,
    });
  } catch (err) {
    console.error("Error creando materia:", err);
    res.status(500).json({
      error: "Error interno al crear materia",
      details: err.message,
    });
  }
}

/**
 * ✅ Obtener todas las materias
 */
export async function getAllMaterias(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT 
          m.id_materia, 
          m.nombre, 
          p.id_profesor,
          p.nombre AS profesor_nombre, 
          p.apellido AS profesor_apellido
       FROM materias m
       LEFT JOIN profesores p ON m.id_profesor = p.id_profesor
       ORDER BY m.nombre ASC`
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "No hay materias registradas" });
    }

    res.json(rows);
  } catch (err) {
    console.error("Error obteniendo materias:", err);
    res.status(500).json({
      error: "Error interno al obtener materias",
      details: err.message,
    });
  }
}
