import {createWorkspace, getWorkspaces, getWorkspaceById, getWorkspaceMembers, getWorkspaceMemberbyId, updateWorkspaceMemberRole, deleteWorkspace} from '../services/workspaceService.js';
import Workspace from '../models/Workspace.js';

const createWorkspaceController = async (req, res) => {
    await createWorkspace(req, res);
}

const getWorkspacesController = async (req, res) => {
    await getWorkspaces(req, res);
}

const getWorkspaceByIdController = async (req, res) => {
    await getWorkspaceById(req, res);
}

const getWorkspaceMembersController = async (req, res) => {
    await getWorkspaceMembers(req, res);
}

const getWorkspaceMemberbyIdController = async (req, res) => {
    await getWorkspaceMemberbyId(req, res);
}

const updateWorkspaceMemberRoleController = async (req, res) => {
    await updateWorkspaceMemberRole(req, res);
}

const deleteWorkspaceController = async (req, res) => {
    await deleteWorkspace(req, res);
}

export const getMyWorkspaces = async (req, res) => {
  try {
    const userId = req.user._id;

    const workspaces = await Workspace.find({
      $or: [{ owner: userId }, { 'members.user': userId }],
    }).select('name slug members owner');

    
    const summaries = await Promise.all(
      workspaces.map(async (ws) => {
        const projectCount = await Project.countDocuments({ workspace: ws._id });
        return {
          _id: ws._id,
          name: ws.name,
          slug: ws.slug,
          memberCount: ws.members.length,
          projectCount,
          isOwner: ws.owner.toString() === userId.toString(),
        };
      })
    );

    res.status(200).json(summaries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching workspace summaries' });
  }
};

export const removeMember = async (req, res) => {
  try {
    const { id, memberId } = req.params;

    const workspace = await Workspace.findById(id);
    if (!workspace) return res.status(404).json({ message: 'Workspace not found' });

    if (workspace.owner.toString() === memberId) {
      return res.status(400).json({ message: 'Cannot remove the workspace owner' });
    }

    workspace.members = workspace.members.filter((m) => m.user.toString() !== memberId);
    await workspace.save();

    res.status(200).json({ message: 'Member removed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error removing member' });
  }
};

export const rename= async (req,res)=>{
    try{
         const {id}=req.params;
         const {name}= req.body;
         const workspace= await Workspace.findById(id);
         if (!workspace) {
         return res.status(404).json({
         message: 'Workspace not found'
         });
      }
         workspace.name=name;
         await workspace.save();

         res.status(200).json(workspace);

    } catch(err){
        console.log(err);
        res.status(500).json({message: 'Server error renaming workspace'})
    }
}

export { createWorkspaceController, getWorkspacesController, getWorkspaceByIdController, getWorkspaceMembersController, getWorkspaceMemberbyIdController, updateWorkspaceMemberRoleController, deleteWorkspaceController, getMyWorkspaces, removeMember, rename };