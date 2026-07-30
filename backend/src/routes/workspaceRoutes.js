import {createWorkspaceController, getWorkspaceController, getWorkspaceByIdController, getWorkspaceMembersController, getWorkspaceMemberbyIdController, updateWorkspaceMemberRoleController, deleteWorkspaceController, removeMember, rename} from '../controllers/workspaceController.js';
import { workspaceSchema, roleSchema } from '../validators/workspace.validator.js';
import restrictTo from '../middlewares/restrictTo.js';
import isMember from '../middlewares/isMember.js';
import isOwner from '../middlewares/isOwner.js';
import express from 'express';
import { validate } from '../middlewares/validate.js';
import protect from '../middlewares/protect.js';
import { inviteTeammate, acceptInvite } from '../controllers/workspaceInviteController.js';
import isAdminOrOwner from '../middlewares/isAdminOrOwner.js';


const router = express.Router();

router.post('/', protect, validate(workspaceSchema), createWorkspaceController);
router.get('/', protect, getWorkspaceController);
router.get('/:id', protect, isMember, getWorkspaceByIdController);
router.get('/:id/members', protect, isMember, getWorkspaceMembersController);
router.get('/:id/members/:memberId', protect, isMember, getWorkspaceMemberbyIdController);
router.put('/:id/members/:memberId', protect, validate(roleSchema), isOwner, updateWorkspaceMemberRoleController);
router.delete('/:id', protect, isOwner, deleteWorkspaceController);
router.post('/:id/invite', protect,isAdminOrOwner, inviteTeammate);
router.post('/join/:token', acceptInvite);
router.delete('/:id/members/:memberId', protect, isOwner,isAdminOrOwner , removeMember);
router.patch('/:id', protect, isAdminOrOwner , rename);

export default router;