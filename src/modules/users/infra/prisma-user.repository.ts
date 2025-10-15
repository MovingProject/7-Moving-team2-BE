import { IUserRepository, PartialUserProfile, UserWithProfile } from '../interface/users.repository.interface';
import { SignUpRequest } from '@/modules/auth/dto/signup.request.dto';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { UpdateUserProfileDto } from '../dto/user.update.dto';
import { UserWithFullProfile } from '../interface/users.repository.interface';
@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<UserWithProfile | null> {
    return await this.prisma.user.findUnique({
      where: { email },
      include: {
        driverProfile: true,
        consumerProfile: true,
      },
    });
  }
  async findById(id: string): Promise<UserWithFullProfile | null> {
    return await this.prisma.user.findUnique({
      where: { id, deletedAt: null },
      include: {
        driverProfile: {
          include: {
            driverServiceTypes: true,
            driverServiceAreas: true,
          },
        },
        consumerProfile: true,
      },
    });
  }
  async createUser(signUpInput: SignUpRequest, hashedPassword: string): Promise<UserWithProfile> {
    const { email, name, phoneNumber, role } = signUpInput;

    return await this.prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        name,
        phoneNumber,
        role,
      },
      include: {
        driverProfile: true,
        consumerProfile: true,
      },
    });
  }

  async getProfileById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        consumerProfile: true,
        driverProfile: {
          include: {
            driverServiceTypes: true,
            driverServiceAreas: true,
          },
        },
      },
    });
  }

  async updateProfile(id: string, dto: UpdateUserProfileDto): Promise<PartialUserProfile> {
    const data: any = {
      name: dto.name,
      email: dto.email,
      phoneNumber: dto.phoneNumber,
      profileImage: dto.profileImage,
    };

    if (dto.passwordHash) {
      data.passwordHash = dto.passwordHash; // 여기에 hashed password 추가
    }

    if (dto.driverProfile) {
      data.driverProfile = {
        upsert: {
          create: {
            nickname: dto.driverProfile?.nickname || '임시닉네임',
            careerYears: dto.driverProfile?.careerYears || '0',
            oneLiner: dto.driverProfile?.oneLiner || '',
            description: dto.driverProfile?.description || '',
          },
          update: dto.driverProfile,
        },
      };
    }

    if (dto.consumerProfile) {
      data.consumerProfile = {
        upsert: {
          create: dto.consumerProfile,
          update: dto.consumerProfile,
        },
      };
    }

    return this.prisma.user.update({
      where: { id },
      data,
      include: {
        driverProfile: {
          include: { driverServiceAreas: true, driverServiceTypes: true },
        },
        consumerProfile: true,
      },
    });
  }
}
