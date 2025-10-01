import { createZodDto } from '@anatine/zod-nestjs';
import { z } from 'zod';
import { Area, MoveType, DriverProfile, DriverServiceArea, DriverServiceType } from '@prisma/client';

export const CreateDriverProfileSchema = z.object({
  image: z.string().url('유효한 URL 형식이 아닙니다.').optional().nullable(),
  nickname: z.string().min(1, '닉네임은 필수입니다.'),
  careerYears: z.string().min(1, '경력 연차는 필수입니다.'),
  oneLiner: z.string().optional().default(''),
  description: z.string().optional().default(''),
  serviceAreas: z
    .array(z.nativeEnum(Area, { errorMap: () => ({ message: '유효한 지역을 선택해주세요.' }) }))
    .optional()
    .default([]),
  serviceTypes: z
    .array(z.nativeEnum(MoveType, { errorMap: () => ({ message: '유효한 서비스 타입을 선택해주세요.' }) }))
    .optional()
    .default([]),
});

export class CreateDriverProfileDto extends createZodDto(CreateDriverProfileSchema) {}

export class BaseDriverProfileDto {
  id: string;
  userId: string;
  image?: string | null;
  nickname: string;
  careerYears: string;
  oneLiner: string;
  description: string;
  rating: number;
  reviewCount: number;
  confirmedCount: number;
  createdAt: Date;
  updatedAt: Date;
  areas: Area[];
  serviceTypes: MoveType[];
}

export class DriverProfileResponseDto extends BaseDriverProfileDto {
  static from(
    profile: DriverProfile & {
      driverServiceAreas?: DriverServiceArea[];
      driverServiceTypes?: DriverServiceType[];
    },
  ): DriverProfileResponseDto {
    const dto = new DriverProfileResponseDto();
    dto.id = profile.id;
    dto.userId = profile.userId;
    dto.image = profile.image ?? null;
    dto.nickname = profile.nickname;
    dto.careerYears = profile.careerYears;
    dto.oneLiner = profile.oneLiner;
    dto.description = profile.description;
    dto.rating = profile.rating;
    dto.reviewCount = profile.reviewCount;
    dto.confirmedCount = profile.confirmedCount;
    dto.createdAt = profile.createdAt;
    dto.updatedAt = profile.updatedAt;

    // 배열로 변환
    dto.areas = profile.driverServiceAreas?.map((a) => a.serviceArea) ?? [];
    dto.serviceTypes = profile.driverServiceTypes?.map((t) => t.serviceType) ?? [];

    return dto;
  }
}
