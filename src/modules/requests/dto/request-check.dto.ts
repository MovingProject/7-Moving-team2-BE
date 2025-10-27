import { z } from 'zod';
export const RequestCheckSchema = z.object({
  pendingRequest: z
    .object({
      id: z.string(),
    })
    .nullable(),
});

export type RequestCheckResponseDto = z.infer<typeof RequestCheckSchema>;
