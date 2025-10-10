import { Inject, Injectable } from '@nestjs/common';
import { USER_REPOSITORY } from './interface/users.repository.interface';
import type { IUserRepository } from './interface/users.repository.interface';
import { NotFoundException, UnauthorizedException } from '@/shared/exceptions';
import { HASHING_SERVICE, type IHashingService } from '@/shared/hashing/hashing.service.interface';
import { UpdateUserProfileDto } from './dto/user.update.Dto';

@Injectable()
export class UsersService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,

    @Inject(HASHING_SERVICE)
    private readonly hashingService: IHashingService,
  ) {}
  //NestJS에서 의존성 주입(Dependency Injection, DI)**을 위해 쓰는 문법
  //constructor(...) : 클래스가 생성될 때 필요한 의존 객체를 받는 자리
  //@Inject(USER_REPOSITORY) : NestJS의 커스텀 토큰을 통해 의존성을 주입하겠다는 표시
  //private readonly userRepository: IUserRepository : 생성자에서 받은 인자를 클래스 멤버로 선언
  //결과 → UsersService 안에서 this.userRepository.findById(...) 같은 호출 가능

  async getUserWithProfile(userId: string) {
    const user = await this.userRepository.getProfileById(userId);

    if (!user) throw new NotFoundException('유저를 찾을수 없습니다.');

    return user;
  }

  async getProfileById(id: string) {
    const user = await this.userRepository.getProfileById(id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateProfile(id: string, dto: UpdateUserProfileDto) {
    console.log('🔥 [updateProfile] id:', id);

    const user = await this.userRepository.getProfileById(id);
    if (!user) throw new NotFoundException('User not found');

    // 비밀번호 변경 처리
    if (dto.currentPassword && dto.newPassword) {
      if (!user.passwordHash) throw new Error('비밀번호가 설정되어 있지 않습니다.');

      const isMatch = await this.hashingService.compare(dto.currentPassword, user.passwordHash);
      if (!isMatch) throw new UnauthorizedException('Current password is incorrect');

      const hashed = await this.hashingService.hash(dto.newPassword);
      dto.passwordHash = hashed; // DTO에 hashed password 추가
    }

    // Prisma용 data 변환
    const data: any = {
      name: dto.name,
      email: dto.email,
      phoneNumber: dto.phoneNumber,
      profileImage: dto.profileImage,
      passwordHash: dto.passwordHash,
    };

    // DriverProfile upsert
    if (dto.driverProfile) {
      data.driverProfile = {
        upsert: {
          create: dto.driverProfile,
          update: dto.driverProfile,
        },
      };
    }

    // ConsumerProfile upsert
    if (dto.consumerProfile) {
      data.consumerProfile = {
        upsert: {
          create: dto.consumerProfile,
          update: dto.consumerProfile,
        },
      };
    }

    return this.userRepository.updateProfile(id, data);
  }
}
