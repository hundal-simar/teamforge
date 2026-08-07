import Comment from '../models/Comment.js';
import { logActivity } from '../services/activityLogger.js';
import { emitToProject } from '../config/socket.js';
import { createNotification } from '../services/notificationService.js';

export const createComment = async (req, res) => {
  try {
    const task = req.task;
    const projectId = task.project._id.toString(); 
    const { text, mentions } = req.body;

    const comment = await Comment.create({
      task: task._id,
      author: req.user._id,
      text,
      mentions,
    });

    const populated = await comment.populate('author', 'username email avatar');

    await logActivity({
      entityType: 'Task',
      entityId: task._id,
      action: 'comment_added',
      userId: req.user._id,
      metadata: { commentId: comment._id, mentionCount: mentions.length },
    });

    emitToProject(projectId, 'comment:added', populated); 

    for (const mentionedUserId of mentions) {
      if (mentionedUserId.toString() !== req.user._id.toString()) {
        await createNotification({
          userId: mentionedUserId,
          type: 'mention',
          payload: {
            taskId: task._id.toString(),
            projectId, 
            actorUsername: req.user.username,
            actorAvatar: req.user.avatar || null,
            commentId: comment._id.toString(),
          },
        });
      }
    }

    res.status(201).json(populated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error creating comment' });
  }
};

export const getComments = async (req, res) => {
  try {
    const { id: taskId } = req.params;
    const comments = await Comment.find({ task: taskId })
      .populate('author', 'username email avatar')
      .populate('mentions', 'username email avatar')
      .sort({ createdAt: 1 });

    res.status(200).json(comments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching comments' });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const comment = await Comment.findById(commentId);

    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only delete your own comments' });
    }

    await comment.deleteOne();

    await logActivity({
      entityType: 'Task',
      entityId: req.task._id,
      action: 'comment_deleted',
      userId: req.user._id,
      metadata: { commentId },
    });

    emitToProject(req.task.project._id.toString(), 'comment:deleted', { commentId, taskId: req.task._id }); 

    res.status(200).json({ message: 'Comment deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error deleting comment' });
  }
};