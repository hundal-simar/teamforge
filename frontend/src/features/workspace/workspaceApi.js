import api from "../../api/axios";

export const getWorkspace = async (userData) => {
    const res=await api.get(`/workspace/`,userData);
    return res.data;
}

export const createWorkspace = async (workspaceData) => {
    const res=await api.post(`/workspace`,workspaceData);
    return res.data;
}

export const getWorkspaceById = async (workspaceId)=>{
    const res= await api.get('/workspace/${workspaceId}')
    return res.data;
}

export const deleteWorkspace= async (workspaceId)=>{
    const res= await api.post('/workspace/${workspaceId}')
    return res.data;
}

export const getWorkspaceMembers=async (workspaceId)=>{
    const res= await api.get('/workspace/${workspaceId}/members');
    return res.data;
}

export const getWorkspaceMemeberById= async (workspaceId, memberId)=>{
    const res= await api.get('/workspace/${workspaceId}/members/${memberId}');
    return res.data;
}

export const updateWorkspaceMemberRole= async (workspaceId, memberId)=>{
    const res= await api.put('/workspace/${workspaceId}/members/${memberId}');
    return res.data;
}