import {createWorkspaceController, getWorkspaceController, getWorkspaceByIdController, getWorkspaceMembersController, getWorkspaceMemberbyIdController, updateWorkspaceMemberRoleController, deleteWorkspaceController} from '../controllers/workspaceController.js';
import { workspaceSchema, roleSchema } from '../validators/workspace.validator.js';
import restrictTo from '../middlewares/restrictTo.js';
import isMember from '../middlewares/isMember.js';
import isOwner from '../middlewares/isOwner.js';
import express from 'express';
import { validate } from '../middlewares/validate.js';
import protect from '../middlewares/protect.js';
import { inviteTeammate, acceptInvite } from '../controllers/workspaceInviteController.js';


const router = express.Router();

router.post('/', protect, validate(workspaceSchema), createWorkspaceController);
router.get('/', protect, getWorkspaceController);
router.get('/:id', protect, isMember, getWorkspaceByIdController);
router.get('/:id/members', protect, isMember, getWorkspaceMembersController);
router.get('/:id/members/:memberId', protect, isMember, getWorkspaceMemberbyIdController);
router.put('/:id/members/:memberId', protect, validate(roleSchema), isOwner, updateWorkspaceMemberRoleController);
router.delete('/:id', protect, isOwner, deleteWorkspaceController);
router.post('/:id/invite', protect,restrictTo('admin','owner'), inviteTeammate);
router.post('/join/:token', acceptInvite);

export default router;