import { z } from 'zod';

export const createKanbanCardSchema = z.object({
  column_id: z.number().int().positive(),
  subject_id: z.number().int().positive().optional(),
  topic_id: z.number().int().positive().optional(),
  objective_id: z.number().int().positive().nullable().optional(),
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  position: z.number().int().min(0).optional(),
  scheduled_for: z.string().date().nullable().optional(),
});

export const updateKanbanCardSchema = createKanbanCardSchema.partial();

export type CreateKanbanCardInput = z.infer<typeof createKanbanCardSchema>;
export type UpdateKanbanCardInput = z.infer<typeof updateKanbanCardSchema>;
