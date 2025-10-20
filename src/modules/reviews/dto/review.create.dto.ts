import { z } from 'zod';

export const reviewSchema = z.object({ rating: z.number().int().min(1).max(5), content: z.string().optional() });

export type reviewDTO = z.infer<typeof reviewSchema>;
export type reviewInput = reviewDTO & { driverId: string; consumerId: string; quotationId: string };
