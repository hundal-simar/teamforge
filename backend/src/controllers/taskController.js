import Task from '../models/Task.js';
import Project from '../models/Project.js';

const ORDER_GAP = 1000; // initial spacing so early inserts don't need renormalizing soon

// POST /api/projects/:id/tasks
// isProjectMember already ran, attached req.project
const createTask = async (req, res) => {
  try {
    const { id: projectId } = req.params;
    const { title, description, columnId, assignedTo, priority, dueDate, labels } = req.body;

    // place new task at the end of the column
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

    res.status(201).json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error creating task' });
  }
};

// GET /api/projects/:id/tasks
// isProjectMember already ran
const listTasks = async (req, res) => {
  try {
    const { id: projectId } = req.params;
    const tasks = await Task.find({ project: projectId }).sort({ columnId: 1, order: 1 });
    res.status(200).json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching tasks' });
  }
};

// PATCH /api/tasks/:id
// isTaskMember already ran, attached req.task
const updateTask = async (req, res) => {
  try {
    const task = req.task;
    Object.assign(task, req.body); // only validated fields land here via Zod
    await task.save();
    res.status(200).json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error updating task' });
  }
};

// PATCH /api/tasks/:id/status
// body: { columnId, order } — order is the float computed on the frontend
// (average of the two neighboring tasks' order values in the target column)
const updateTaskStatus = async (req, res) => {
  try {
    const task = req.task;
    const { columnId, order } = req.body;

    task.columnId = columnId;
    task.order = order;
    await task.save();

    res.status(200).json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error updating task status' });
  }
};

// POST /api/tasks/:id/subtasks
const addSubtask = async (req, res) => {
  try {
    const task = req.task; // attached by isTaskMember
    const { title } = req.body;

    task.subtasks.push({ title, isDone: false });
    await task.save();

    res.status(201).json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error adding subtask' });
  }
};

// PATCH /api/tasks/:id/subtasks/:subtaskId/toggle
const toggleSubtask = async (req, res) => {
  try {
    const task = req.task;
    const { subtaskId } = req.params;
    const { isDone } = req.body;

    const subtask = task.subtasks.id(subtaskId);
    if (!subtask) return res.status(404).json({ message: 'Subtask not found' });

    subtask.isDone = isDone;
    await task.save();

    res.status(200).json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error updating subtask' });
  }
};

// DELETE /api/tasks/:id/subtasks/:subtaskId
const deleteSubtask = async (req, res) => {
  try {
    const task = req.task;
    const { subtaskId } = req.params;

    const subtask = task.subtasks.id(subtaskId);
    if (!subtask) return res.status(404).json({ message: 'Subtask not found' });

    subtask.deleteOne();
    await task.save();

    res.status(200).json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error deleting subtask' });
  }
};

const getTaskDetail = async (req, res) => {
  const task = await req.task.populate('assignedTo', 'name email');
  res.status(200).json(task);
};

export { createTask, listTasks, updateTask, updateTaskStatus, addSubtask, toggleSubtask, deleteSubtask, getTaskDetail };