import pool from "../config/db.js";

/**
 * ✅ Obtener todas las clases con sus materias y profesor asociado
 */
export async function getAllClases(req, res) {
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

    if (rows.length === 0) {
      return res.status(404).json({ message: "No hay clases registradas" });
    }

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
export async function getMateriasPorProfesor(req, res) {
  try {
    const { profesorId } = req.params;

    if (!profesorId || isNaN(profesorId)) {
      return res.status(400).json({ error: "El parámetro profesorId debe ser numérico" });
    }

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

    if (rows.length === 0) {
      return res.status(404).json({
        message: "El profesor no tiene materias asignadas",
      });
    }

    res.json(rows);
  } catch (err) {
    console.error("Error en getMateriasPorProfesor:", err);
    res.status(500).json({
      error: "Error al obtener materias por profesor",
      details: err.message,
    });
  }
}

/**
 * ✅ Crear una nueva clase
 */
export async function createClase(req, res) {
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
    res.status(500).json({
      error: "Error al crear la clase",
      details: err.message,
    });
  }
}

/**
 * ✅ Asignar una materia a una clase
 */
export async function asignarMateriaAClase(req, res) {
  try {
    const { id_clase, id_materia } = req.body;

    if (!id_clase || !id_materia) {
      return res.status(400).json({ error: "Faltan campos: id_clase o id_materia" });
    }

    if (isNaN(id_clase) || isNaN(id_materia)) {
      return res.status(400).json({ error: "Los IDs deben ser numéricos" });
    }

    // Verificar si ya existe esa relación
    const [existe] = await pool.query(
      "SELECT * FROM clase_materia WHERE id_clase = ? AND id_materia = ?",
      [id_clase, id_materia]
    );

    if (existe.length > 0) {
      return res.status(409).json({
        message: "La materia ya está asignada a esta clase",
      });
    }

    await pool.query(
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
    res.status(500).json({
      error: "Error al asignar materia a clase",
      details: err.message,
    });
  }
}
