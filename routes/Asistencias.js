const express = require("express");
const router = express.Router();
const db = require("../db");
const { verificarToken } = require("./auth"); // Middleware del login

// ===============================
// ✅ Ruta de prueba
// ===============================
router.get("/", (req, res) => {
  res.json({ message: "Ruta de asistencias funcionando 🚀" });
});

// ===============================
// 📌 CRUD BÁSICO
// ===============================

// 🔹 Obtener todas las asistencias (PROFESOR)
router.get("/all", verificarToken, (req, res) => {
  // Solo los profesores deberían acceder
  if (req.user.tipo !== "profesor") {
    return res.status(403).json({ message: "Acceso denegado: solo profesores" });
  }

  const sql = `
    SELECT a.id, al.nombre, al.apellido, m.nombre AS materia, c.fecha, a.estado, a.fecha_registro
    FROM asistencias a
    JOIN alumnos al ON a.alumno_id = al.id
    JOIN clases c ON a.clase_id = c.id
    JOIN materias m ON c.materia_id = m.id
    ORDER BY c.fecha DESC;
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: "Error en la base de datos" });
    res.json(results);
  });
});

// 🔹 Crear una asistencia (PROFESOR)
router.post("/", verificarToken, (req, res) => {
  if (req.user.tipo !== "profesor") {
    return res.status(403).json({ message: "Acceso denegado: solo profesores" });
  }

  const { alumno_id, clase_id, estado } = req.body;
  if (!alumno_id || !clase_id || !estado) {
    return res.status(400).json({ message: "Faltan datos" });
  }

  const sql = "INSERT INTO asistencias (alumno_id, clase_id, estado) VALUES (?, ?, ?)";
  db.query(sql, [alumno_id, clase_id, estado], (err, result) => {
    if (err) return res.status(500).json({ message: "Error al registrar asistencia" });
    res.json({ message: "Asistencia registrada ✅", id: result.insertId });
  });
});

// 🔹 Actualizar una asistencia (PROFESOR)
router.put("/:id", verificarToken, (req, res) => {
  if (req.user.tipo !== "profesor") {
    return res.status(403).json({ message: "Acceso denegado: solo profesores" });
  }

  const { id } = req.params;
  const { estado } = req.body;
  const sql = "UPDATE asistencias SET estado = ? WHERE id = ?";

  db.query(sql, [estado, id], (err) => {
    if (err) return res.status(500).json({ message: "Error al actualizar asistencia" });
    res.json({ message: "Asistencia actualizada ✏️" });
  });
});

// 🔹 Eliminar una asistencia (PROFESOR)
router.delete("/:id", verificarToken, (req, res) => {
  if (req.user.tipo !== "profesor") {
    return res.status(403).json({ message: "Acceso denegado: solo profesores" });
  }

  const { id } = req.params;
  const sql = "DELETE FROM asistencias WHERE id = ?";

  db.query(sql, [id], (err) => {
    if (err) return res.status(500).json({ message: "Error al eliminar asistencia" });
    res.json({ message: "Asistencia eliminada 🗑️" });
  });
});

// ===============================
// 📌 RUTAS ESPECIALES
// ===============================

// 🔹 Asistencias del alumno logueado (ALUMNO)
router.get("/mias", verificarToken, (req, res) => {
  if (req.user.tipo !== "alumno") {
    return res.status(403).json({ message: "Acceso denegado: solo alumnos" });
  }

  const usuarioId = req.user.id; // viene del token JWT

  const sql = `
    SELECT a.id, m.nombre AS materia, c.fecha, a.estado
    FROM asistencias a
    JOIN alumnos al ON a.alumno_id = al.id
    JOIN clases c ON a.clase_id = c.id
    JOIN materias m ON c.materia_id = m.id
    WHERE al.usuario_id = ?
    ORDER BY c.fecha DESC;
  `;

  db.query(sql, [usuarioId], (err, results) => {
    if (err) {
      console.error("Error en /asistencias/mias:", err);
      return res.status(500).json({ message: "Error obteniendo asistencias del alumno" });
    }
    res.json(results);
  });
});

// 🔹 Porcentaje de asistencia de un alumno en una materia
router.get("/porcentaje/:alumnoId/:materiaId", verificarToken, (req, res) => {
  const { alumnoId, materiaId } = req.params;
  const sql = `
    SELECT al.nombre, al.apellido, m.nombre AS materia,
           SUM(a.estado = 'Presente') AS presentes,
           COUNT(*) AS total_clases,
           ROUND(SUM(a.estado = 'Presente') * 100 / COUNT(*), 2) AS porcentaje_asistencia
    FROM asistencias a
    JOIN alumnos al ON a.alumno_id = al.id
    JOIN clases c ON a.clase_id = c.id
    JOIN materias m ON c.materia_id = m.id
    WHERE al.id = ? AND m.id = ?
    GROUP BY al.nombre, al.apellido, m.nombre;
  `;
  db.query(sql, [alumnoId, materiaId], (err, results) => {
    if (err) return res.status(500).json({ message: "Error obteniendo porcentaje" });
    res.json(results);
  });
});

// 🔹 Alumnos ausentes en una clase (solo profesor)
router.get("/ausentes/:claseId", verificarToken, (req, res) => {
  if (req.user.tipo !== "profesor") {
    return res.status(403).json({ message: "Acceso denegado: solo profesores" });
  }

  const { claseId } = req.params;
  const sql = `
    SELECT al.nombre, al.apellido, a.estado
    FROM asistencias a
    JOIN alumnos al ON a.alumno_id = al.id
    WHERE a.clase_id = ? AND a.estado = 'Ausente';
  `;
  db.query(sql, [claseId], (err, results) => {
    if (err) return res.status(500).json({ message: "Error obteniendo ausentes" });
    res.json(results);
  });
});

module.exports = router;
