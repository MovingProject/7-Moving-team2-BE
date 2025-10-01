// src/modules/users/profile/profile.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { ProfileRepository } from './infra/profile.repository';
import { CreateConsumerProfileDto } from './dto/createConsumerProfile.dto';
import { CreateDriverProfileDto } from './dto/createDriverProfile.dto';
import { ConsumerProfile, DriverProfile, Area, MoveType } from '@prisma/client';

@Injectable()
export class ProfileService {
  constructor(private readonly repo: ProfileRepository) {}

  //소비자 프로필 생성
  async createConsumerProfile(userId: string, dto: CreateConsumerProfileDto): Promise<ConsumerProfile> {
    if (!dto.serviceType || !dto.areas) {
      throw new BadRequestException('serviceType과 area는 필수 값입니다.');
    }

    return this.repo.createConsumerProfile(userId, dto.image ?? null, dto.serviceType as MoveType, dto.areas as Area);
  }

  /**
   * 기사 프로필 생성

  async createDriverProfile(userId: string, dto: CreateDriverProfileDto): Promise<DriverProfile> {
    if (!dto.nickname) {
      throw new BadRequestException('nickname은 필수 값입니다.');
    }

    return this.repo.createDriverProfile(
      userId,
      dto.image ?? null,
      dto.nickname,
      String(dto.careerYears ?? '0'),   // 스키마가 string 타입
      dto.oneLiner ?? '',
      dto.description ?? '',
      (dto.serviceTypes ?? []) as MoveType[],
      (dto.serviceAreas ?? []) as Area[],
    );
  }

  /**
   * 닉네임 중복 검사
  async isDriverNicknameTaken(nickname: string): Promise<boolean> {
    const existing = await this.repo.findDriverProfileByNickname(nickname);
    return !!existing;
  }   */
}
