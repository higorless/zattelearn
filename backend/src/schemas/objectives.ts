import { z } from 'zod';

export const createObjectiveSchema = z.object({
  subject_id: z.number().int().positive(),
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  status: z.enum(['pending', 'in_progress', 'done']).optional(),
  due_date: z.string().date().optional(),
});

export const updateObjectiveSchema = createObjectiveSchema.partial();

export type CreateObjectiveInput = z.infer<typeof createObjectiveSchema>;
export type UpdateObjectiveInput = z.infer<typeof updateObjectiveSchema>;
