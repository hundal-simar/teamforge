import Project from '../models/Project.js';

const isProjectMember = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id).populate('workspace');
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const workspace = project.workspace;
    const isOwner = workspace.owner.toString() === req.user._id.toString();
    const isMember = workspace.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!isOwner && !isMember) {
      return res.status(403).json({ message: 'You are not a member of this workspace' });
    }

    req.project = project; // stash so the controller doesn't refetch
    next();
  } catch (error) {
    res.status(500).json({ message: 'Error checking project membership', error });
  }
};

export default isProjectMember;