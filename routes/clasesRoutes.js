import express from 'express';
import { getAllClases } from '../controllers/clasesController.js';

const router = express.Router();

router.get('/', getAllClases);

export default router;
