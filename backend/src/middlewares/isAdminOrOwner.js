import Workspace from '../models/Workspace.js';

const isAdminOrOwner = async (req, res, next) => {
  try {
    const workspace = await Workspace.findById(req.params.id);
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    const isOwner = workspace.owner.toString() === req.user._id.toString();
    const memberEntry = workspace.members.find(
      (m) => m.user.toString() === req.user._id.toString()
    );
    const isAdmin = memberEntry?.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Only admins or the owner can perform this action' });
    }

    req.workspace = workspace; 
    next();
  } catch (error) {
    res.status(500).json({ message: 'Error checking permissions', error });
  }
};

export default isAdminOrOwner;