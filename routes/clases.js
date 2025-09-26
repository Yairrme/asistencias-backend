const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/", (req, res) => {
  const sql = `
    SELECT c.id, c.fecha, m.nombre AS materia
    FROM clases c
    JOIN materias m ON c.materia_id = m.id
    ORDER BY c.fecha DESC;
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

module.exports = router;
