import { z } from 'zod';

export const updateProfileSchema = z.object({
  username: z.string().trim().min(3, 'Username must be at least 3 characters').optional(),
});