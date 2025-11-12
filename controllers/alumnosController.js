import pool from "../config/db.js";

/**
 * ✅ Obtener todos los alumnos, o filtrar por materia si se pasa ?materia=ID
 */
export async function getAllAlumnos(req, res) {
  try {
    const { materia } = req.query;

    // Si no se filtra por materia → devolver todos los alumnos
    if (!materia) {
      const [rows] = await pool.query(
        `SELECT id_alumno, nombre, apellido, dni, email
         FROM alumnos
         ORDER BY apellido, nombre`
      );

      if (rows.length === 0) {
        return res.status(404).json({ message: "No hay alumnos registrados" });
      }

      return res.json(rows);
    }

    // Si se filtra por materia → traer alumnos inscritos en la materia (tabla alumno_materia)
    const [rows] = await pool.query(
      `SELECT DISTINCT a.id_alumno, a.nombre, a.apellido, a.dni, a.email
       FROM alumnos a
       JOIN alumno_materia am ON a.id_alumno = am.id_alumno
       WHERE am.id_materia = ?`,
      [materia]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: "No se encontraron alumnos para la materia indicada",
      });
    }

    res.json(rows);
  } catch (err) {
    console.error("Error en getAllAlumnos:", err);
    res.status(500).json({
      error: "Error interno del servidor",
      details: err.message,
    });
  }
}

/**
 * ✅ Gestión de alumnos y consultas relacionadas con materias
 * Las relaciones ahora usan la tabla `alumno_materia` para asociar alumnos y materias.
 */
