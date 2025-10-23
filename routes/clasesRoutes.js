import express from "express";
import {
  getAllClases,
  getMateriasPorProfesor,
  createClase,
  asignarMateriaAClase
} from "../controllers/clasesController.js";

const router = express.Router();

router.get("/", getAllClases);
router.post("/", createClase);
router.get("/por-profesor/:profesorId", getMateriasPorProfesor); // Obtener materias de un profesor específico

//Esto sirve relacionar clases con materias
router.post("/materia", asignarMateriaAClase);

export default router;