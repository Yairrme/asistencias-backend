import express from "express";
import pool from "../config/db.js";

const router = express.Router();

/**
 * ✅ Obtener todos los profesores registrados
 */
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id_profesor, nombre, apellido, email FROM profesores ORDER BY nombre ASC"
    );
    res.json(rows);
  } catch (err) {
    console.error("Error al obtener profesores:", err);
    res.status(500).json({ error: "Error al obtener profesores" });
  }
});

/**
 * ✅ Obtener un profesor por ID (opcional)
 */
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(
      "SELECT id_profesor, nombre, apellido, email FROM profesores WHERE id_profesor = ?",
      [id]
    );
    if (rows.length === 0)
      return res.status(404).json({ error: "Profesor no encontrado" });

    res.json(rows[0]);
  } catch (err) {
    console.error("Error al obtener profesor:", err);
    res.status(500).json({ error: "Error al obtener profesor" });
  }
});

export default router;
