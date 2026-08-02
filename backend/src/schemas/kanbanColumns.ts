import { z } from 'zod';

export const createKanbanColumnSchema = z.object({
  title: z.string().min(1).max(255),
  position: z.number().int().min(0).optional(),
});

export const updateKanbanColumnSchema = createKanbanColumnSchema.partial();

export type CreateKanbanColumnInput = z.infer<typeof createKanbanColumnSchema>;
export type UpdateKanbanColumnInput = z.infer<typeof updateKanbanColumnSchema>;
