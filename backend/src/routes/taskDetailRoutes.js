import express from 'express';
import { updateTask, updateTaskStatus } from '../controllers/taskController.js';
import protect from '../middlewares/protect.js';
import isTaskMember from '../middlewares/isTaskMember.js';
import { validate } from '../middlewares/validate.js';
import { updateTaskSchema, updateTaskStatusSchema } from '../validators/task.validator.js';

const router = express.Router();

router.patch('/:id', protect, isTaskMember, validate(updateTaskSchema), updateTask);
router.patch('/:id/status', protect, isTaskMember, validate(updateTaskStatusSchema), updateTaskStatus);

export default router;