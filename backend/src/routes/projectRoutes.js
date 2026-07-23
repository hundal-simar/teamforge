import express from 'express';
import {createProject, listProjects} from '../controllers/projectController';
import protect from '../middlewares/protect';
import isMember from '../middlewares/isMember';
import validate from '../middlewares/validate';
import { createProjectSchema } from '../validators/project.validator';

const router = express.Router();

router.post('/:id/projects', protect, isMember, validate(createProjectSchema), createProject);
router.get('/:id/projects', protect, isMember, listProjects);

export default router;