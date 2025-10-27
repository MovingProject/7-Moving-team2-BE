import { z } from 'zod';

export const reviewSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  content: z.string(),
  quotationId: z.string().uuid(),
});

export type reviewDto = z.infer<typeof reviewSchema>;
export type reviewInput = reviewDto & { driverId: string; consumerId: string };
