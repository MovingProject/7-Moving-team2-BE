import { Inject, Injectable } from '@nestjs/common';
import { USER_REPOSITORY } from './interface/users.repository.interface';
import type { IUserRepository } from './interface/users.repository.interface';
import { NotFoundException, BadRequestException } from '@/shared/exceptions';
import { HASHING_SERVICE, type IHashingService } from '@/shared/hashing/hashing.service.interface';
import { UpdateUserProfileDto } from './dto/user.update.dto';
import { MeProfileDto } from './dto/me-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(HASHING_SERVICE)
    private readonly hashingService: IHashingService,
  ) {}

  async getUserWithProfile(userId: string) {
    const user = await this.userRepository.getProfileById(userId);
    if (!user) throw new NotFoundException('유저를 찾을 수 없습니다.');

    return user;
  }
  async getUserProfile(id: string) {
    const user = await this.userRepository.getProfileById(id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async getUserwithFullProfile(id: string) {
    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) throw new NotFoundException('유저를 찾을 수 없습니다.');
    if (existingUser.driverProfile) {
      const { driverProfile } = existingUser;

      const region = driverProfile.driverServiceAreas.map((a) => a.serviceArea);
      const service = driverProfile.driverServiceTypes.map((t) => t.serviceType);

      const dto = new MeProfileDto();
      dto.id = existingUser.id;
      dto.email = existingUser.email;
      dto.name = existingUser.name;
      dto.role = existingUser.role;
      dto.phoneNumber = existingUser.phoneNumber;
      dto.profileType = 'DRIVER';

      dto.nickname = driverProfile.nickname;
      dto.image = driverProfile.image;
      dto.experience = driverProfile.careerYears;
      dto.bio = driverProfile.oneLiner;
      dto.description = driverProfile.description;

      dto.region = region;
      dto.service = service;

      dto.likeCount = driverProfile.likeCount;
      dto.rating = driverProfile.rating;
      dto.reviewCount = driverProfile.reviewCount;
      dto.confirmedCount = driverProfile.confirmedCount;

      return dto;
    }

    // 소비자 프로필인 경우
    if (existingUser.consumerProfile) {
      const { consumerProfile } = existingUser;

      const dto = new MeProfileDto();
      dto.id = existingUser.id;
      dto.email = existingUser.email;
      dto.name = existingUser.name;
      dto.role = existingUser.role;
      dto.profileType = 'CONSUMER';
      dto.phoneNumber = existingUser.phoneNumber;
      dto.image = consumerProfile.image;
      dto.region = consumerProfile.areas ? [consumerProfile.areas] : undefined;
      dto.service = consumerProfile.serviceType ? [consumerProfile.serviceType] : undefined;

      return dto;
    }

    // 프로필 둘 다 없는 경우
    throw new NotFoundException('프로필이 없습니다.');
  }

  async updateProfile(id: string, dto: UpdateUserProfileDto) {
    const user = await this.userRepository.getProfileById(id);
    if (!user) throw new NotFoundException('User not found');

    // 비밀번호 변경 처리
    if (dto.currentPassword && dto.newPassword) {
      if (!user.passwordHash) throw new Error('비밀번호가 설정되어 있지 않습니다.');

      const isMatch = await this.hashingService.compare(dto.currentPassword, user.passwordHash);
      if (!isMatch) throw new BadRequestException('현재 비밀번호가 올바르지 않습니다.');

      const hashed = await this.hashingService.hash(dto.newPassword);
      dto.passwordHash = hashed;
    }

    // Repository로 위임
    return this.userRepository.updateProfile(id, dto);
  }
}
