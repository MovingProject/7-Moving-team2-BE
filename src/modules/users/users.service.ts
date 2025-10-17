import { Inject, Injectable } from '@nestjs/common';
import { USER_REPOSITORY } from './interface/users.repository.interface';
import type { IUserRepository } from './interface/users.repository.interface';
import { NotFoundException, UnauthorizedException } from '@/shared/exceptions';
import { HASHING_SERVICE, type IHashingService } from '@/shared/hashing/hashing.service.interface';
import { UpdateUserProfileDto } from './dto/user.update.dto';

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

  async getProfileById(id: string) {
    const user = await this.userRepository.getProfileById(id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateProfile(id: string, dto: UpdateUserProfileDto) {
    const user = await this.userRepository.getProfileById(id);
    if (!user) throw new NotFoundException('User not found');

    // 비밀번호 변경 처리
    if (dto.currentPassword && dto.newPassword) {
      if (!user.passwordHash) throw new Error('비밀번호가 설정되어 있지 않습니다.');

      const isMatch = await this.hashingService.compare(dto.currentPassword, user.passwordHash);
      if (!isMatch) throw new UnauthorizedException('현재 비밀번호가 올바르지 않습니다.');

      const hashed = await this.hashingService.hash(dto.newPassword);
      dto.passwordHash = hashed;
    }

    // Repository로 위임
    return this.userRepository.updateProfile(id, dto);
  }
}
