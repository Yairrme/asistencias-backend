import express from "express";
import { getAllAlumnos, asignarClaseAAlumno } from "../controllers/alumnosController.js";

const router = express.Router();

// Obtener alumnos (opcionalmente filtrados por materia)
router.get("/", getAllAlumnos);

// Asignar alumno a clase
router.post("/clase", asignarClaseAAlumno);

export default router;