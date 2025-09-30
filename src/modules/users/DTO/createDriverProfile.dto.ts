import { Area, MoveType, DriverProfile, DriverServiceArea, DriverServiceType } from '@prisma/client';

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
  serviceTypes: MoveType[]; // DriverServiceType 목록
}

export class DriverProfileResponseDto extends BaseDriverProfileDto {}

export class CreateDriverProfileDto {
  static toResponseDto(
    input: DriverProfile & {
      driverServiceAreas?: DriverServiceArea[];
      driverServiceTypes?: DriverServiceType[];
    },
  ): DriverProfileResponseDto {
    const dto = new DriverProfileResponseDto();

    dto.id = input.id;
    dto.userId = input.userId;
    dto.image = input.image ?? null;
    dto.nickname = input.nickname;
    dto.careerYears = input.careerYears;
    dto.oneLiner = input.oneLiner;
    dto.description = input.description;
    dto.rating = input.rating;
    dto.reviewCount = input.reviewCount;
    dto.confirmedCount = input.confirmedCount;
    dto.createdAt = input.createdAt;
    dto.updatedAt = input.updatedAt;

    return dto;
  }
}
