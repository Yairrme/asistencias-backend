const express = require('express');
const router = express.Router();
const db = require('../db'); // conexión a MySQL

// ✅ Probar que funciona
router.get('/', (req, res) => {
  res.json({ message: "Ruta de asistencias funcionando 🚀" });
});


// ==================
// 📌 CRUD BÁSICO
// ==================

// Obtener todas las asistencias
router.get('/all', (req, res) => {
  const sql = `
    SELECT a.id, al.nombre, al.apellido, m.nombre AS materia, c.fecha, a.estado, a.fecha_registro
    FROM asistencias a
    JOIN alumnos al ON a.alumno_id = al.id
    JOIN clases c ON a.clase_id = c.id
    JOIN materias m ON c.materia_id = m.id
    ORDER BY c.fecha DESC;
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

// Crear asistencia
router.post('/', (req, res) => {
  const { alumno_id, clase_id, estado } = req.body;
  if (!alumno_id || !clase_id || !estado) {
    return res.status(400).json({ error: "Faltan datos" });
  }
  const sql = "INSERT INTO asistencias (alumno_id, clase_id, estado) VALUES (?, ?, ?)";
  db.query(sql, [alumno_id, clase_id, estado], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Asistencia registrada ✅", id: result.insertId });
  });
});

// Actualizar asistencia
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;
  const sql = "UPDATE asistencias SET estado = ? WHERE id = ?";
  db.query(sql, [estado, id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Asistencia actualizada ✏️" });
  });
});

// Eliminar asistencia
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM asistencias WHERE id = ?";
  db.query(sql, [id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Asistencia eliminada 🗑️" });
  });
});


// ==================
// 📌 CONSULTAS ESPECIALES
// ==================

// 1. Todas las asistencias de un alumno
router.get('/alumno/:alumnoId', (req, res) => {
  const { alumnoId } = req.params;
  const sql = `
    SELECT al.nombre, al.apellido, m.nombre AS materia, c.fecha, a.estado
    FROM asistencias a
    JOIN alumnos al ON a.alumno_id = al.id
    JOIN clases c ON a.clase_id = c.id
    JOIN materias m ON c.materia_id = m.id
    WHERE al.id = ?
    ORDER BY c.fecha;
  `;
  db.query(sql, [alumnoId], (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

// 2. Resumen de asistencias por clase
router.get('/resumen/:claseId', (req, res) => {
  const { claseId } = req.params;
  const sql = `
    SELECT c.fecha, m.nombre AS materia, a.estado, COUNT(*) AS cantidad
    FROM asistencias a
    JOIN clases c ON a.clase_id = c.id
    JOIN materias m ON c.materia_id = m.id
    WHERE c.id = ?
    GROUP BY c.fecha, m.nombre, a.estado;
  `;
  db.query(sql, [claseId], (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

// 3. Porcentaje de asistencia de un alumno en una materia
router.get('/porcentaje/:alumnoId/:materiaId', (req, res) => {
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
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

// 4. Alumnos ausentes en una clase
router.get('/ausentes/:claseId', (req, res) => {
  const { claseId } = req.params;
  const sql = `
    SELECT al.nombre, al.apellido, a.estado
    FROM asistencias a
    JOIN alumnos al ON a.alumno_id = al.id
    WHERE a.clase_id = ? AND a.estado = 'Ausente';
  `;
  db.query(sql, [claseId], (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

module.exports = router;
// ==================================
// ==================