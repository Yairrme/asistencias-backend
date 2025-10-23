import pool from "../config/db.js";

/**
 * ✅ Obtener todos los alumnos, o filtrar por materia si se pasa ?materia=ID
 */
export async function getAllAlumnos(req, res, next) {
  try {
    const { materia } = req.query;

    // Si no se filtra por materia → devolver todos los alumnos
    if (!materia) {
      const [rows] = await pool.query(
        `SELECT id_alumno, nombre, apellido, dni, email
         FROM alumnos
         ORDER BY apellido, nombre`
      );
      return res.json(rows);
    }

    // Si se filtra por materia → traer alumnos inscritos en clases que tengan esa materia
    const [rows] = await pool.query(
      `SELECT DISTINCT a.id_alumno, a.nombre, a.apellido, a.dni, a.email
       FROM alumnos a
       JOIN alumno_clase ac ON a.id_alumno = ac.id_alumno
       JOIN clase_materia cm ON ac.id_clase = cm.id_clase
       WHERE cm.id_materia = ?`,
      [materia]
    );

    res.json(rows);
  } catch (err) {
    console.error("Error en getAllAlumnos:", err);
    res.status(500).json({
      error: "Error interno del servidor",
      details: err.message,
    });
  }
}

// Esto es para relacionar alumno con clase
export async function asignarClaseAAlumno(req, res, next) {
  try {
    const { id_alumno, id_clase } = req.body;

    if (!id_alumno || !id_clase) {
      return res.status(400).json({ error: "Faltan campos: id_alumno o id_clase" });
    }

    const [result] = await pool.query(
      "INSERT INTO alumno_clase (id_alumno, id_clase) VALUES (?, ?)",
      [id_alumno, id_clase]
    );

    res.status(201).json({
      message: "Alumno asignado a la clase correctamente ✅",
      id_alumno,
      id_clase,
    });
  } catch (err) {
    console.error("Error asignando alumno a clase:", err);
    next(err);
  }
}