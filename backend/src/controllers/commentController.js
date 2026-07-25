import Comment from '../models/Comment.js';
import { logActivity } from '../services/activityLogger.js';
import { emitToProject } from '../socket/socketServer.js';

// POST /api/tasks/:id/comments
// isTaskMember already ran, attached req.task
const createComment = async (req, res) => {
  try {
    const task = req.task;
    const { text, mentions } = req.body;

    const comment = await Comment.create({
      task: task._id,
      author: req.user._id,
      text,
      mentions,
    });

    const populated = await comment.populate('author', 'name email');

    await logActivity({
      entityType: 'Task',
      entityId: task._id,
      action: 'comment_added',
      userId: req.user._id,
      metadata: { commentId: comment._id, mentionCount: mentions.length },
    });

    emitToProject(task.project.toString(), 'comment:added', populated);

    res.status(201).json(populated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error creating comment' });
  }
};

// GET /api/tasks/:id/comments
const getComments = async (req, res) => {
  try {
    const { id: taskId } = req.params;
    const comments = await Comment.find({ task: taskId })
      .populate('author', 'name email')
      .populate('mentions', 'name email')
      .sort({ createdAt: 1 });

    res.status(200).json(comments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching comments' });
  }
};

// DELETE /api/tasks/:id/comments/:commentId
const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const comment = await Comment.findById(commentId);

    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    // only the author can delete their own comment
    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only delete your own comments' });
    }

    await comment.deleteOne();
    emitToProject(req.task.project.toString(), 'comment:deleted', { commentId, taskId: req.task._id });

    res.status(200).json({ message: 'Comment deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error deleting comment' });
  }
};

export { createComment, getComments, deleteComment };