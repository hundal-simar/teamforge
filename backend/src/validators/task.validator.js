import { z } from 'zod';

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id');

export const createTaskSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  description: z.string().trim().optional().default(''),
  columnId: z.string().min(1, 'columnId is required'),
  assignedTo: objectId.optional().nullable(),
  priority: z.enum(['low', 'medium', 'high']).optional().default('medium'),
  dueDate: z.coerce.date().optional().nullable(),
  labels: z.array(z.string()).optional().default([]),
});

export const updateTaskSchema = z.object({
  title: z.string().trim().min(1).optional(),
  description: z.string().trim().optional(),
  assignedTo: objectId.optional().nullable(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  dueDate: z.coerce.date().optional().nullable(),
  labels: z.array(z.string()).optional(),
});

export const updateTaskStatusSchema = z.object({
  columnId: z.string().min(1, 'columnId is required'),
  order: z.number({ required_error: 'order is required' }),
});