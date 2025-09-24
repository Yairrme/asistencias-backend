const express = require('express');
const router = express.Router();
const db = require('../db'); // Asegurate de tener db.js con la conexión a MySQL

// Obtener todas las asistencias
router.get('/', (req, res) => {
  const sql = `
    SELECT a.id, al.nombre, al.apellido, c.materia, a.estado, a.fecha_registro
    FROM asistencias a
    JOIN alumnos al ON a.alumno_id = al.id
    JOIN clases c ON a.clase_id = c.id
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

// Obtener asistencias de una clase
router.get('/clase/:claseId', (req, res) => {
  const { claseId } = req.params;
  const sql = `
    SELECT a.id, al.nombre, al.apellido, a.estado, a.fecha_registro
    FROM asistencias a
    JOIN alumnos al ON a.alumno_id = al.id
    WHERE a.clase_id = ?
  `;
  db.query(sql, [claseId], (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

// Crear asistencia
router.post('/', (req, res) => {
  const { alumno_id, clase_id, estado } = req.body;
  const sql = 'INSERT INTO asistencias (alumno_id, clase_id, estado) VALUES (?, ?, ?)';
  db.query(sql, [alumno_id, clase_id, estado], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: 'Asistencia registrada', id: result.insertId });
  });
});

// Actualizar asistencia
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;
  const sql = 'UPDATE asistencias SET estado = ? WHERE id = ?';
  db.query(sql, [estado, id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: 'Asistencia actualizada' });
  });
});

// Eliminar asistencia
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM asistencias WHERE id = ?';
  db.query(sql, [id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: 'Asistencia eliminada' });
  });
});

module.exports = router;
