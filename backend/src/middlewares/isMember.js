import Workspace from '../models/Workspace';
import User from '../models/User';

const isMember = async (req, res, next) => {
  try {
    const workspace = await Workspace.findById(req.params.id);
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }
    const isMember = workspace.members.some(member => member.user.toString() === req.user._id.toString());
    if (!isMember) {
      return res.status(403).json({ message: 'You are not a member of this workspace' });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: 'Error checking membership', error });
  }
};

export default isMember;