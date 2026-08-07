import express from 'express';
import {createProject, listProjects} from '../controllers/projectController.js';
import protect from '../middlewares/protect.js';
import isMember from '../middlewares/isMember.js';
import validate from '../middlewares/validate.js';
import { createProjectSchema } from '../validators/project.validator.js';

const router = express.Router();

router.post('/:id/projects', protect, isMember, validate(createProjectSchema), createProject);
router.get('/:id/projects', protect, isMember, listProjects);

export default router;