import {z} from 'zod';

export const workspaceSchema = z.object({
    name: z.string().min(1, { message: "Workspace name is required" }),
    slug: z.string().min(1, { message: "Workspace slug is required" }),
});

export const roleSchema = z.object({
    role: z.enum(['admin', 'owner', 'member'], { message: "Invalid role" }),
});