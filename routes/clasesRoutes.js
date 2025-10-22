import express from "express";
import { getAllClases, getMateriasPorProfesor } from "../controllers/clasesController.js";

const router = express.Router();

// Obtener todas las clases
router.get("/", getAllClases);

// Obtener materias de un profesor específico
router.get("/por-profesor/:profesorId", getMateriasPorProfesor);

export default router;
