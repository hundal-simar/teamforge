import api from "../../api/axios";

export const getWorkspace = async (userData) => {
    const res=await api.get(`/workspaces/`,userData);
    return res.data;
}

export const createWorkspace = async (workspaceData) => {
    const res=await api.post(`/workspaces`,workspaceData);
    return res.data;
}

export const getWorkspaceById = async (workspaceId)=>{
    const res= await api.get(`/workspaces/${workspaceId}`)
    return res.data;
}

export const deleteWorkspace= async (workspaceId)=>{
    const res= await api.delete(`/workspaces/${workspaceId}`)
    return res.data;
}

export const getWorkspaceMembers=async (workspaceId)=>{
    const res= await api.get(`/workspaces/${workspaceId}/members`);
    return res.data;
}

export const getWorkspaceMemeberById= async (workspaceId, memberId)=>{
    const res= await api.get(`/workspaces/${workspaceId}/members/${memberId}`);
    return res.data;
}

export const updateWorkspaceMemberRole= async (workspaceId, memberId)=>{
    const res= await api.put(`/workspaces/${workspaceId}/members/${memberId}`);
    return res.data;
}