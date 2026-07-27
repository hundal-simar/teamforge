import express from 'express';
import {getProjectDetail, updateColumns} from '../controllers/projectController';
import protect from '../middlewares/protect';
import isProjectMember from '../middlewares/isProjectMember';
import validate from '../middlewares/validate';
import { updateColumnsSchema } from '../validators/project.validator';
import { getProjectActivity } from '../controllers/activityController.js';
import { getBoard } from '../controllers/boardController.js';



const router = express.Router();

router.get('/:id', protect, isProjectMember, getProjectDetail);
router.patch('/:id/columns', protect, isProjectMember, validate(updateColumnsSchema), updateColumns);
router.get('/:id/activity', protect, isProjectMember, getProjectActivity);
router.get('/:id/board', protect, isProjectMember, getBoard);

export default router;