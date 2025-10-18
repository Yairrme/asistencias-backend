const express = require('express');
const router = express.Router();
const db = require('../db');

// OBTENER TODAS las asistencias (ruta para el profesor)
router.get('/', (req, res) => {
    const sql = `
        SELECT a.id, a.fecha, a.estado, u.nombre AS alumno, m.nombre AS materia
        FROM asistencias a
        JOIN usuarios u ON a.alumno_id = u.id
        JOIN clases c ON a.clase_id = c.id
        JOIN materias m ON c.materia_id = m.id
        ORDER BY a.fecha DESC
    `;
    db.query(sql, (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

// OBTENER asistencias DE UN ALUMNO por su ID
router.get('/por-alumno/:id', (req, res) => {
    const alumnoId = req.params.id;
    const sql = `
        SELECT a.id, a.fecha, a.estado, m.nombre AS materia
        FROM asistencias a
        JOIN clases c ON a.clase_id = c.id
        JOIN materias m ON c.materia_id = m.id
        WHERE a.alumno_id = ?
        ORDER BY a.fecha DESC
    `;
    db.query(sql, [alumnoId], (err, results) => {
        if (err) {
            console.error('Error al obtener asistencias:', err);
            res.status(500).json({ error: 'Error del servidor' });
        } else {
            res.json(results);
        }
    });
});

// REGISTRAR una nueva asistencia
router.post('/', (req, res) => {
    const { fecha, estado, alumno_id, clase_id } = req.body;
    const sql = 'INSERT INTO asistencias (fecha, estado, alumno_id, clase_id) VALUES (?, ?, ?, ?)';
    db.query(sql, [fecha, estado, alumno_id, clase_id], (err, result) => {
        if (err) throw err;
        res.status(201).json({ mensaje: 'Asistencia registrada', id: result.insertId });
    });
});

module.exports = router;