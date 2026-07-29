import express from 'express';
import { getMyWorkspaces } from '../controllers/workspaceController.js';
import protect from '../middlewares/protect.js';

const router = express.Router();

router.get('/workspaces', protect, getMyWorkspaces);

export default router;