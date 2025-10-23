import pool from "../config/db.js";

/**
 * ✅ Obtener todas las clases con sus materias y profesor asociado
 */
export async function getAllClases(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT 
          c.id_clase AS id,
          c.nombre AS clase_nombre,
          c.anio,
          m.id_materia,
          m.nombre AS materia,
          p.id_profesor,
          CONCAT(p.nombre, ' ', p.apellido) AS profesor
       FROM clases c
       LEFT JOIN clase_materia cm ON c.id_clase = cm.id_clase
       LEFT JOIN materias m ON cm.id_materia = m.id_materia
       LEFT JOIN profesores p ON m.id_profesor = p.id_profesor
       ORDER BY c.anio DESC, c.nombre ASC`
    );
    res.json(rows);
  } catch (err) {
    console.error("Error en getAllClases:", err);
    res.status(500).json({
      error: "Error interno del servidor",
      details: err.message,
    });
  }
}

/**
 * ✅ Obtener las materias que dicta un profesor específico
 */
export async function getMateriasPorProfesor(req, res, next) {
  try {
    const { profesorId } = req.params;
    const [rows] = await pool.query(
      `SELECT 
          m.id_materia,
          m.nombre AS materia,
          c.id_clase,
          c.nombre AS clase_nombre,
          c.anio
       FROM materias m
       LEFT JOIN clase_materia cm ON m.id_materia = cm.id_materia
       LEFT JOIN clases c ON cm.id_clase = c.id_clase
       WHERE m.id_profesor = ?
       ORDER BY c.anio DESC, c.nombre ASC`,
      [profesorId]
    );
    res.json(rows);
  } catch (err) {
    console.error("Error en getMateriasPorProfesor:", err);
    res.status(500).json({
      error: "Error interno del servidor",
      details: err.message,
    });
  }
}

//Crear una nueva clase
export async function createClase(req, res, next) {
  try {
    const { nombre, anio } = req.body;

    if (!nombre || !anio) {
      return res.status(400).json({ error: "Faltan campos: nombre o anio" });
    }

    const [result] = await pool.query(
      "INSERT INTO clases (nombre, anio) VALUES (?, ?)",
      [nombre, anio]
    );

    res.status(201).json({
      message: "Clase creada correctamente ✅",
      id_clase: result.insertId,
    });
  } catch (err) {
    console.error("Error creando clase:", err);
    next(err);
  }
}

export async function asignarMateriaAClase(req, res, next) {
  try {
    const { id_clase, id_materia } = req.body;

    if (!id_clase || !id_materia) {
      return res.status(400).json({ error: "Faltan campos: id_clase o id_materia" });
    }

    const [result] = await pool.query(
      "INSERT INTO clase_materia (id_clase, id_materia) VALUES (?, ?)",
      [id_clase, id_materia]
    );

    res.status(201).json({
      message: "Materia asignada a la clase correctamente ✅",
      id_clase,
      id_materia,
    });
  } catch (err) {
    console.error("Error asignando materia a clase:", err);
    next(err);
  }
}