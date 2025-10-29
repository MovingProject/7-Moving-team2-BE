import { createZodDto } from '@anatine/zod-nestjs';
import { z } from 'zod';

export const getCurrentWeatherQuerySchema = z
  .object({
    city: z
      .string({
        required_error: '도시 이름은 필수입니다.',
      })
      .min(1, '도시 이름은 비워둘 수 없습니다.'),
  })
  .strict();

export type GetCurrentWeatherQuery = z.infer<typeof getCurrentWeatherQuerySchema>;

export class GetCurrentWeatherQueryDto extends createZodDto(getCurrentWeatherQuerySchema) {}

export const getWeeklyForecastQuerySchema = z
  .object({
    city: z
      .string({
        required_error: '도시 이름은 필수입니다.',
      })
      .min(1, '도시 이름은 비워둘 수 없습니다.'),
    days: z
      .number()
      .int()
      .min(1, '예보 일수는 최소 1일 이상이어야 합니다.')
      .max(10, '예보 일수는 최대 10일까지 가능합니다.')
      .default(7),
  })
  .strict();

export type GetWeeklyForecastQuery = z.infer<typeof getWeeklyForecastQuerySchema>;

export class GetWeeklyForecastQueryDto extends createZodDto(getWeeklyForecastQuerySchema) {}
