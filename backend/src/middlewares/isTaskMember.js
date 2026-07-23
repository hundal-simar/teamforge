import Task from '../models/Task.js';

const isTaskMember = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id).populate({
      path: 'project',
      populate: { path: 'workspace' },
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const workspace = task.project.workspace;
    const isOwner = workspace.owner.toString() === req.user._id.toString();
    const isMember = workspace.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!isOwner && !isMember) {
      return res.status(403).json({ message: 'You are not a member of this workspace' });
    }

    req.task = task; // stash so controller doesn't refetch
    next();
  } catch (error) {
    res.status(500).json({ message: 'Error checking task membership', error });
  }
};

export default isTaskMember;