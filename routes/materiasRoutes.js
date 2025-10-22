import express from "express";
import db from "../config/db.js";

const router = express.Router();

// Obtener todas las materias
router.get("/", async (req, res) => {
  try {
    const [results] = await db.query("SELECT * FROM materias");
    res.json(results);
  } catch (error) {
    console.error("Error al obtener materias:", error);
    res.status(500).json({ error: "Error al obtener materias" });
  }
});

export default router;
