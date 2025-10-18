import express from 'express';
import { getAllAlumnos } from '../controllers/alumnosController.js';

const router = express.Router();

router.get('/', getAllAlumnos);

export default router;

