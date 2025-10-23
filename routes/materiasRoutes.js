import express from "express";
import { createMateria, getAllMaterias } from "../controllers/materiasController.js";

const router = express.Router();

// Crear materia
router.post("/", createMateria);

// Obtener todas las materias
router.get("/", getAllMaterias);

export default router;
