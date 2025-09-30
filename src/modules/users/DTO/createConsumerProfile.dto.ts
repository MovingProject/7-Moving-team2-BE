import { Area, MoveType, ConsumerProfile } from '@prisma/client';

export class BaseConsumerProfileDto {
  id: string;
  consumerId: string;
  image?: string | null;
  serviceType: MoveType;
  areas: Area;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export class ConsumerProfileResponseDto extends BaseConsumerProfileDto {}

export class CreateConsumerProfileDto {
  static toResponseDto(cp: ConsumerProfile): ConsumerProfileResponseDto {
    const dto = new ConsumerProfileResponseDto();
    dto.id = cp.id;
    dto.consumerId = cp.consumerId;
    dto.image = cp.image ?? null;
    dto.serviceType = cp.serviceType;
    dto.areas = cp.areas ?? [];
    dto.createdAt = cp.createdAt;
    dto.updatedAt = cp.updatedAt;
    dto.deletedAt = cp.deletedAt ?? undefined;
    return dto;
  }
}
