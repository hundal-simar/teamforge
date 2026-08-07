import express from 'express';
import {getProjectDetail, updateColumns} from '../controllers/projectController.js';
import protect from '../middlewares/protect.js';
import isProjectMember from '../middlewares/isProjectMember.js';
import validate from '../middlewares/validate.js';
import { updateColumnsSchema } from '../validators/project.validator.js';
import { getProjectActivity } from '../controllers/activityController.js';
import { getBoard } from '../controllers/boardController.js';



const router = express.Router();

router.get('/:id', protect, isProjectMember, getProjectDetail);
router.patch('/:id/columns', protect, isProjectMember, validate(updateColumnsSchema), updateColumns);
router.get('/:id/activity', protect, isProjectMember, getProjectActivity);
router.get('/:id/board', protect, isProjectMember, getBoard);

export default router;