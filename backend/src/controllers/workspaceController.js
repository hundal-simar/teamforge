import {createWorkspace, getWorkspaces, getWorkspaceById, getWorkspaceMembers, getWorkspaceMemberbyId, updateWorkspaceMemberRole, deleteWorkspace} from '../services/workspaceService.js';

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

export { createWorkspaceController, getWorkspacesController, getWorkspaceByIdController, getWorkspaceMembersController, getWorkspaceMemberbyIdController, updateWorkspaceMemberRoleController, deleteWorkspaceController };