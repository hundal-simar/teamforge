const Workspace = require('../models/workspaceModel');
const User = require('../models/userModel');

const isOwner = async (req, res, next) => {
  try {
    const workspace = await Workspace.findById(req.params.id);
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }
    if (workspace.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You are not the owner of this workspace' });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: 'Error checking ownership', error });
  }
};

module.exports = isOwner;