import { z } from 'zod';

export const createGoalSchema = z.object({
  subject_id: z.number().int().positive(),
  topic_id: z.number().int().positive().optional(),
  title: z.string().min(1).max(255),
  target_hours: z.number().positive(),
  deadline: z.string().date().optional(),
});

export const updateGoalSchema = createGoalSchema.partial();

export type CreateGoalInput = z.infer<typeof createGoalSchema>;
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>;
