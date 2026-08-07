import Task from '../models/Task.js';
import Project from '../models/Project.js';
import Workspace from '../models/Workspace.js';
import { emitToProject } from '../config/socket.js';
import { logActivity } from '../services/activityLogger.js';
import { createNotification } from '../services/notificationService.js';
import { cacheDel, boardCacheKey } from '../utils/cache.js';

const ORDER_GAP = 1000;

// POST /api/projects/:id/tasks 
export const createTask = async (req, res) => {
  try {
    const { id: projectId } = req.params;
    const { title, description, columnId, assignedTo, priority, dueDate, labels } = req.body;

    const lastTask = await Task.findOne({ project: projectId, columnId })
      .sort({ order: -1 })
      .limit(1);

    const order = lastTask ? lastTask.order + ORDER_GAP : ORDER_GAP;

    const task = await Task.create({
      title,
      description,
      project: projectId,
      columnId,
      order,
      assignedTo,
      priority,
      dueDate,
      labels,
    });

    await cacheDel(boardCacheKey(projectId));
    emitToProject(projectId, 'task:updated', task);

    
    if (assignedTo && assignedTo !== req.user._id.toString()) {
      await createNotification({
        userId: assignedTo,
        type: 'assignment',
        payload: {
          taskId: task._id.toString(),
          projectId,
          actorUsername: req.user.username,
          actorAvatar: req.user.avatar || null,
        },
      });
    }

    await logActivity({
      entityType: 'Task',
      entityId: task._id,
      action: 'task_created',
      userId: req.user._id,
      metadata: { title: task.title, columnId: task.columnId },
    });
    res.status(201).json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error creating task' });
  }
};

export const listTasks = async (req, res) => {
  try {
    const { id: projectId } = req.params;
    const tasks = await Task.find({ project: projectId })
      .populate('assignedTo', 'username email')
      .sort({ columnId: 1, order: 1 });
    res.status(200).json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching tasks' });
  }
};

// PATCH /api/tasks/:id — isTaskMember already ran, task.project is POPULATED
export const updateTask = async (req, res) => {
  try {
    const task = req.task;
    const projectId = task.project._id.toString(); 
    const previousAssignee = task.assignedTo?.toString();

    if ('dueDate' in req.body) {
      const newDueDate = req.body.dueDate ? new Date(req.body.dueDate).toISOString() : null;
      const oldDueDate = task.dueDate ? task.dueDate.toISOString() : null;
      if (newDueDate !== oldDueDate) {
        task.remindedAt = null;
      }
    }

    Object.assign(task, req.body);
    await task.save();
    await cacheDel(boardCacheKey(projectId));

    if (req.body.assignedTo && req.body.assignedTo !== previousAssignee && req.body.assignedTo !== req.user._id.toString()) {
      await createNotification({
        userId: req.body.assignedTo,
        type: 'assignment',
        payload: {
          taskId: task._id.toString(),
          projectId, // fixed
          actorUsername: req.user.username,
          actorAvatar: req.user.avatar || null,
        },
      });
    }

    await logActivity({
      entityType: 'Task',
      entityId: task._id,
      action: 'task_moved',
      userId: req.user._id,
      metadata: { toColumnId: task.columnId },
    });

    emitToProject(projectId, 'task:updated', task); 
    res.status(200).json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error updating task' });
  }
};

export const updateTaskStatus = async (req, res) => {
  try {
    const task = req.task;
    const projectId = task.project._id.toString(); 
    const { columnId, order } = req.body;

    task.columnId = columnId;
    task.order = order;
    await task.save();
    await cacheDel(boardCacheKey(projectId));

    emitToProject(projectId, 'task:moved', task); 
    res.status(200).json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error updating task status' });
  }
};

export const addSubtask = async (req, res) => {
  try {
    const task = req.task;
    const projectId = task.project._id.toString(); 
    const { title } = req.body;

    task.subtasks.push({ title, isDone: false });
    await task.save();
    await cacheDel(boardCacheKey(projectId));
    emitToProject(projectId, 'task:updated', task); 
    res.status(201).json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error adding subtask' });
  }
};

export const toggleSubtask = async (req, res) => {
  try {
    const task = req.task;
    const projectId = task.project._id.toString(); 
    const { subtaskId } = req.params;
    const { isDone } = req.body;

    const subtask = task.subtasks.id(subtaskId);
    if (!subtask) return res.status(404).json({ message: 'Subtask not found' });

    subtask.isDone = isDone;
    await task.save();
    await cacheDel(boardCacheKey(projectId));
    emitToProject(projectId, 'task:updated', task); 
    res.status(200).json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error updating subtask' });
  }
};

export const deleteSubtask = async (req, res) => {
  try {
    const task = req.task;
    const projectId = task.project._id.toString(); 
    const { subtaskId } = req.params;

    const subtask = task.subtasks.id(subtaskId);
    if (!subtask) return res.status(404).json({ message: 'Subtask not found' });

    subtask.deleteOne();
    await task.save();
    await cacheDel(boardCacheKey(projectId));
    emitToProject(projectId, 'task:updated', task); 
    res.status(200).json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error deleting subtask' });
  }
};

export const getTaskDetail = async (req, res) => {
  const task = await req.task.populate('assignedTo', 'username email avatar');
  res.status(200).json(task);
};

export const deleteTask = async (req, res) => {
  try {
    const task = req.task;
    const projectId = task.project._id.toString(); 

    await task.deleteOne();
    await cacheDel(boardCacheKey(projectId));

    await logActivity({
      entityType: 'Task',
      entityId: task._id,
      action: 'task_deleted',
      userId: req.user._id,
      metadata: { title: task.title },
    });

    emitToProject(projectId, 'task:deleted', { taskId: task._id });
    res.status(200).json({ message: 'Task deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error deleting task' });
  }
};

export const searchTasks = async (req, res) => {
  try {
    const userId = req.user._id;
    const { search, assignee, priority } = req.query;

    const myWorkspaces = await Workspace.find({
      $or: [{ owner: userId }, { 'members.user': userId }],
    }).distinct('_id');

    const myProjectIds = await Project.find({ workspace: { $in: myWorkspaces } }).distinct('_id');

    const filter = { project: { $in: myProjectIds } };
    if (search) filter.$text = { $search: search };
    if (assignee) filter.assignedTo = assignee;
    if (priority) filter.priority = priority;

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'username email')
      .populate('project', 'name')
      .sort(search ? { score: { $meta: 'textScore' } } : { createdAt: -1 })
      .limit(50);

    res.status(200).json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error searching tasks' });
  }
};