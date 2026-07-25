import { z } from 'zod';

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id');

export const createCommentSchema = z.object({
  text: z.string().trim().min(1, 'Comment text is required'),
  mentions: z.array(objectId).optional().default([]),
});