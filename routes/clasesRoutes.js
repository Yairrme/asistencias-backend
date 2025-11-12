import express from "express";

const router = express.Router();

// Stub: este enrutador ya no proporciona funcionalidad específica.
router.use((req, res) => {
  res.status(404).json({ message: "Endpoint eliminado. Use materias, alumnos o asistencias." });
});

export default router;
