import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string().trim().min(1, 'Project name is required'),
  description: z.string().trim().optional().default(''),
});

const columnSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1),
  order: z.number().int().nonnegative(),
});

export const updateColumnsSchema = z.object({
  columns: z
    .array(columnSchema)
    .min(1, 'columns must be a non-empty array')
    .refine(
      (cols) => new Set(cols.map((c) => c.id)).size === cols.length,
      { message: 'Column ids must be unique' }
    ),
});