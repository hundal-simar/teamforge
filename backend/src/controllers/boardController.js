import Project from '../models/Project.js';
import Task from '../models/Task.js';
import { cacheGet, cacheSet, boardCacheKey } from '../utils/cache.js';

// GET /api/projects/:id/board

export const getBoard = async (req, res) => {
  try {
    const { id: projectId } = req.params;
    const key = boardCacheKey(projectId);

    const cached = await cacheGet(key);
    if (cached) {
      return res.status(200).json({ ...cached, cached: true }); 
    }

    const project = await Project.findById(projectId).populate('workspace', 'name slug');
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const tasks = await Task.find({ project: projectId })
      .populate('assignedTo', 'username email avatar')
      .sort({ columnId: 1, order: 1 });

    const board = { project, tasks };
    await cacheSet(key, board);

    res.status(200).json({ ...board, cached: false });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching board' });
  }
};