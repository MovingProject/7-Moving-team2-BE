import { z } from 'zod';
export const RequestCheckSchema = z.object({
  pendingRequest: z
    .object({
      id: z.string(),
      serviceType: z.string(),
      moveAt: z.string(),
      departureAddress: z.string(),
      departureFloor: z.number(),
      departureElevator: z.boolean(),
      departurePyeong: z.number(),
      arrivalAddress: z.string(),
      arrivalFloor: z.number(),
      arrivalElevator: z.boolean(),
      arrivalPyeong: z.number(),
      additionalRequirements: z.string().nullable().optional(),
    })
    .nullable(),
});

export type RequestCheckResponseDto = z.infer<typeof RequestCheckSchema>;
