import { z } from 'zod';

export const createTopicSchema = z.object({
  subject_id: z.number().int().positive(),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
});

export const updateTopicSchema = createTopicSchema.partial();

export type CreateTopicInput = z.infer<typeof createTopicSchema>;
export type UpdateTopicInput = z.infer<typeof updateTopicSchema>;
