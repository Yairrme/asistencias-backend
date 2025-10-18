import express from 'express';
import { getAllAsistencias, getAsistenciasByAlumno, createAsistencia } from '../controllers/asistenciasController.js';

const router = express.Router();

router.get('/', getAllAsistencias);
router.get('/por-alumno/:alumnoId', getAsistenciasByAlumno);
router.post('/', createAsistencia);

export default router;
