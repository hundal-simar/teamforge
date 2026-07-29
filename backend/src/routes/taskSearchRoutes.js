import express from 'express';
import { searchTasks } from '../controllers/taskController.js';
import protect from '../middlewares/protect.js';

const router = express.Router();

router.get('/', protect, searchTasks);

export default router;