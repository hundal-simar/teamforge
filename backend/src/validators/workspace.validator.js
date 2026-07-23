import {z} from 'zod';

 const workspaceSchema = z.object({
    name: z.string().min(1, { message: "Workspace name is required" }),
    slug: z.string().min(1, { message: "Workspace slug is required" }),
});

const roleSchema = z.object({
    role: z.enum(['admin', 'owner', 'member']),
});

export default {workspaceSchema, roleSchema};