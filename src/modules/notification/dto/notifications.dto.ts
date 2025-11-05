import z from 'zod';

export const MarkReadSchema = z.object({
  ids: z.array(z.string().uuid()),
});
export type MarkReadDto = z.infer<typeof MarkReadSchema>;
