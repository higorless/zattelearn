import { z } from 'zod';

export const createZettelNoteSchema = z.object({
  session_id: z.number().int().positive().optional(),
  title: z.string().min(1).max(255),
  content: z.string().min(1),
  tags: z.array(z.string()).optional(),
});

export const updateZettelNoteSchema = createZettelNoteSchema.partial();

export type CreateZettelNoteInput = z.infer<typeof createZettelNoteSchema>;
export type UpdateZettelNoteInput = z.infer<typeof updateZettelNoteSchema>;
