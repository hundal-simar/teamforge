import express from 'express';
import { updateTask, updateTaskStatus, addSubtask, toggleSubtask, deleteSubtask , deleteTask} from '../controllers/taskController.js';
import protect from '../middlewares/protect.js';
import isTaskMember from '../middlewares/isTaskMember.js';
import { validate } from '../middlewares/validate.js';
import { updateTaskSchema, updateTaskStatusSchema, addSubtaskSchema, toggleSubtaskSchema, getTaskDetail } from '../validators/task.validator.js';
import { createComment, getComments, deleteComment } from '../controllers/commentController.js';
import { createCommentSchema } from '../validators/comment.validator.js';
import upload from '../middlewares/upload.js';
import { addAttachment, deleteAttachment } from '../controllers/attachmentController.js';

const router = express.Router();

router.patch('/:id', protect, isTaskMember, validate(updateTaskSchema), updateTask);
router.patch('/:id/status', protect, isTaskMember, validate(updateTaskStatusSchema), updateTaskStatus);
router.get('/:id', protect, isTaskMember, getTaskDetail);
router.delete('/:id', protect, isTaskMember, deleteTask);



router.post('/:id/subtasks', protect, isTaskMember, validate(addSubtaskSchema), addSubtask);
router.patch('/:id/subtasks/:subtaskId/toggle', protect, isTaskMember, validate(toggleSubtaskSchema), toggleSubtask);
router.delete('/:id/subtasks/:subtaskId', protect, isTaskMember, deleteSubtask);

router.post('/:id/comments', protect, isTaskMember, validate(createCommentSchema), createComment);
router.get('/:id/comments', protect, isTaskMember, getComments);
router.delete('/:id/comments/:commentId', protect, isTaskMember, deleteComment);

router.post('/:id/attachments', protect, isTaskMember, upload.single('file'), addAttachment);
router.delete('/:id/attachments/:attachmentId', protect, isTaskMember, deleteAttachment);

export default router;