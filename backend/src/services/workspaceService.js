import Workspace from "../models/Workspace";
import User from "../models/User";

const createWorkspace = async (req, res) => {
    const { name, slug } = req.body;
    const userId = req.user._id;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const workspace = new Workspace({
            name,
            slug,
            owner: userId,
            members: [{ user: userId, role: "owner" }],
        });

        await workspace.save();
        res.status(201).json(workspace);
    } catch (error) {
        res.status(500).json({ message: "Error creating workspace", error });
    }
};

const getWorkspaces = async (req, res) => {
    const userId = req.user._id;
    try {
        const workspaces = await Workspace.find({ members: { $elemMatch: { user: userId } } });
        res.status(200).json(workspaces);
    } catch (error) {
        res.status(500).json({ message: "Error fetching workspaces", error });
    }
};

const getWorkspaceById = async (req, res) => {
    const { id } = req.params;
    try {
        const workspace = await Workspace.findById(id)
            .populate('owner', 'username email')
            .populate('members.user', 'username email');
        if (!workspace) {
            return res.status(404).json({ message: "Workspace not found" });
        }
        res.status(200).json(workspace);
    } catch (error) {
        res.status(500).json({ message: "Error fetching workspace", error });
    }
};

const getWorkspaceMembers = async (req, res) => {
    const { id } = req.params;
    try {
        const workspace = await Workspace.findById(id).populate('members.user', 'username email');
        if (!workspace) {
            return res.status(404).json({ message: "Workspace not found" });
        }
        res.status(200).json(workspace.members);
    } catch (error) {
        res.status(500).json({ message: "Error fetching workspace members", error });
    }
};

const getWorkspaceMemberbyId = async (req, res) => {
    const { id, memberId } = req.params;
    try {
        const workspace = await Workspace.findById(id).populate('members.user', 'username email');
        if (!workspace) {
            return res.status(404).json({ message: "Workspace not found" });
        }
        const member = workspace.members.find(m => m._id.toString() === memberId);
        if (!member) {
            return res.status(404).json({ message: "Member not found" });
        }
        res.status(200).json(member);
    } catch (error) {
        res.status(500).json({ message: "Error fetching workspace member", error });
    }
};

const updateWorkspaceMemberRole = async (req, res) => {
    const { id, memberId } = req.params;
    const { role } = req.body;
    try {
        const workspace = await Workspace.findById(id);
        if (!workspace) {
            return res.status(404).json({ message: "Workspace not found" });
        }
        const member = workspace.members.find(m => m._id.toString() === memberId);
        if (!member) {
            return res.status(404).json({ message: "Member not found" });
        }
        if (member.role === "owner") {
            throw new Error("Owner role cannot be modified");
        }
        member.role = role;
        await workspace.save();
        res.status(200).json(member);
    } catch (error) {
        res.status(500).json({ message: "Error updating workspace member role", error });
    }
};

const deleteWorkspace = async (req, res) => {
    const { id } = req.params;
    try {
        const workspace = await Workspace.findByIdAndDelete(id);
        if (!workspace) {
            return res.status(404).json({ message: "Workspace not found" });
        }
        res.status(200).json({ message: "Workspace deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting workspace", error });
    }
};


export { createWorkspace, getWorkspaces, getWorkspaceById, deleteWorkspace, getWorkspaceMembers, getWorkspaceMemberbyId, updateWorkspaceMemberRole };