import { z } from 'zod';

export const getReviewsQuerySchema = z.object({
  cursor: z.string().uuid().optional(),
  limit: z.coerce.number().min(1).max(20).default(5),
});

export const reviewResponseSchema = z.object({
  id: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  content: z.string(),
  consumerName: z.string(),
  createdAt: z.string().datetime(),
});

export const reviewListResponseSchema = z.object({
  reviews: z.array(reviewResponseSchema),
  nextCursor: z.string().uuid().nullable(),
});

export type GetReviewsQueryDto = z.infer<typeof getReviewsQuerySchema>;
export type ReviewResponseDto = z.infer<typeof reviewResponseSchema>;
export type ReviewListResponseDto = z.infer<typeof reviewListResponseSchema>;
