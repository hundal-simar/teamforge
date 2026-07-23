import express from 'express';
import { createTask, listTasks } from '../controllers/taskController.js';
import protect from '../middlewares/protect.js';
import isProjectMember from '../middlewares/isProjectMember.js';
import { validate } from '../middlewares/validate.js';
import { createTaskSchema } from '../validators/task.validator.js';

const router = express.Router();

router.post('/:id/tasks', protect, isProjectMember, validate(createTaskSchema), createTask);
router.get('/:id/tasks', protect, isProjectMember, listTasks);

export default router;