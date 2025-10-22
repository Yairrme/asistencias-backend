import express from "express";
import db from "../config/db.js";

const router = express.Router();

// Obtener alumnos (opcionalmente filtrados por materia)
router.get("/", async (req, res) => {
  const { materia } = req.query;

  try {
    let query = "SELECT * FROM alumnos";
    const params = [];

    if (materia) {
      query = `
        SELECT a.* 
        FROM alumnos a
        INNER JOIN alumno_materia am ON a.id = am.alumno_id
        WHERE am.materia_id = ?;
      `;
      params.push(materia);
    }

    const [results] = await db.query(query, params);
    res.json(results);
  } catch (error) {
    console.error("Error al obtener alumnos:", error);
    res.status(500).json({ error: "Error al obtener alumnos" });
  }
});

export default router;
