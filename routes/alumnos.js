const express = require('express');
const router = express.Router();
const db = require('../db');

// Obtener todos los alumnos
router.get('/', (req, res) => {
    db.query('SELECT id, nombre FROM usuarios WHERE tipo="alumno"', (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

// Crear un nuevo alumno (si lo necesitas)
router.post('/', (req, res) => {
    // Lógica para crear un alumno
});

module.exports = router;