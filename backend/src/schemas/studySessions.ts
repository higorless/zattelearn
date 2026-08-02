import { z } from 'zod';

export const createStudySessionSchema = z.object({
  card_id: z.number().int().positive(),
  started_at: z.string().datetime().optional(),
  ended_at: z.string().datetime().optional(),
  duration_seconds: z.number().int().min(0).optional(),
});

export const updateStudySessionSchema = z.object({
  ended_at: z.string().datetime().optional(),
  duration_seconds: z.number().int().min(0).optional(),
});

export type CreateStudySessionInput = z.infer<typeof createStudySessionSchema>;
export type UpdateStudySessionInput = z.infer<typeof updateStudySessionSchema>;
