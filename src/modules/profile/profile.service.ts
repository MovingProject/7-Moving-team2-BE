import { Injectable, NotFoundException } from '@nestjs/common';
import { Area, MoveType } from '@prisma/client';
import { ProfileRepository } from './domain/profile.repository';
import { CreateConsumerProfileDto } from './dto/createConsumerProfile.dto';
import { CreateDriverProfileDto } from './dto/createDriverProfile.dto';

@Injectable()
export class ProfileService {
  constructor(private readonly repo: ProfileRepository) {}

  async createConsumerProfile(dto: CreateConsumerProfileDto) {
    const user = await this.repo.findUserById(dto.userId);
    if (!user) throw new NotFoundException('User not found');

    const consumer = await this.repo.upsertConsumerProfile({
      userId: dto.userId,
      image: dto.image ?? undefined,
      serviceType: (dto.serviceType as MoveType) ?? undefined,
      areas: (dto.areas as Area[]) ?? [],
    });

    return consumer;
  }

  async createDriverProfile(dto: CreateDriverProfileDto) {
    const user = await this.repo.findUserById(dto.userId);
    if (!user) throw new NotFoundException('User not found');

    // 트랜잭션: 프로필 upsert → 연결 테이블 입력 → 최신 상태 조회
    const result = await this.repo.$tx(async () => {
      const driver = await this.repo.upsertDriverProfile({
        userId: dto.userId,
        image: dto.image ?? undefined,
        nickname: dto.nickname,
        careerYears: dto.careerYears ?? 0,
        oneLiner: dto.oneLiner ?? '',
        description: dto.description ?? '',
      });

      await this.repo.createDriverAreasIfAny(driver.id, dto.serviceAreas);
      await this.repo.createDriverTypesIfAny(driver.id, dto.MoveTypes);

      const full = await this.repo.getDriverProfileFull(driver.id);
      return full!;
    });

    return result;
  }
}
