import { IUserRepository, PartialUserProfile, UserWithProfile } from '../interface/users.repository.interface';
import { SignUpRequest } from '@/modules/auth/dto/signup.request.dto';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { UpdateUserProfileDto } from '../dto/user.update.dto';
import { UserWithFullProfile } from '../interface/users.repository.interface';
import { Area, MoveType } from '@prisma/client';

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

  async findByProviderId(provider: string, providerId: string): Promise<UserWithProfile | null> {
    return await this.prisma.user.findUnique({
      where: {
        provider_providerId: {
          provider,
          providerId,
        },
      },
      include: {
        driverProfile: true,
        consumerProfile: true,
      },
    });
  }

  async updateUserProvider(userId: string, provider: string, providerId: string): Promise<UserWithProfile> {
    return await this.prisma.user.update({
      where: { id: userId },
      data: {
        provider,
        providerId,
      },
      include: {
        driverProfile: true,
        consumerProfile: true,
      },
    });
  }

  async createSocialUser(profile: SocialProfile): Promise<UserWithProfile> {
    const { email, name, provider, providerId } = profile;
    return await this.prisma.user.create({
      data: {
        email,
        name,
        provider,
        providerId,
        phoneNumber: 'SOCIAL_LOGIN_PENDING',
        role: 'CONSUMER', //가입시 롤리 없으므로 기본적으로 소비자로 설정해둠
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
    const userData: {
      name?: string;
      email?: string;
      phoneNumber?: string;
      profileImage?: string;
      passwordHash?: string;
      driverProfile?: any;
      consumerProfile?: any;
    } = {
      name: dto.name,
      email: dto.email,
      phoneNumber: dto.phoneNumber,
      profileImage: dto.profileImage,
      passwordHash: dto.passwordHash,
    };

    if (dto.driverProfile) {
      const dp = dto.driverProfile;
      userData.driverProfile = {
        upsert: {
          create: {
            nickname: dp.nickname ?? '임시닉네임',
            careerYears: dp.careerYears ?? '0',
            oneLiner: dp.oneLiner ?? '',
            description: dp.description ?? '',
            ...(dp.rating !== undefined ? { rating: dp.rating } : {}),
          },
          update: {
            ...(dp.nickname !== undefined ? { nickname: dp.nickname } : {}),
            ...(dp.careerYears !== undefined ? { careerYears: dp.careerYears } : {}),
            ...(dp.oneLiner !== undefined ? { oneLiner: dp.oneLiner } : {}),
            ...(dp.description !== undefined ? { description: dp.description } : {}),
            ...(dp.rating !== undefined ? { rating: dp.rating } : {}),
          },
        },
      };
    }

    if (dto.consumerProfile) {
      const cp = dto.consumerProfile;
      userData.consumerProfile = {
        upsert: {
          create: {
            ...(cp.serviceType !== undefined ? { serviceType: cp.serviceType as any } : {}),
            ...(cp.areas !== undefined ? { areas: cp.areas as any } : {}),
            ...(cp.image !== undefined ? { image: cp.image } : {}),
          },
          update: {
            ...(cp.serviceType !== undefined ? { serviceType: cp.serviceType as any } : {}),
            ...(cp.areas !== undefined ? { areas: cp.areas as any } : {}),
            ...(cp.image !== undefined ? { image: cp.image } : {}),
          },
        },
      };
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const base = await tx.user.update({
        where: { id },
        data: userData,
        include: {
          driverProfile: true,
          consumerProfile: true,
        },
      });

      const driverProfileId = base.driverProfile?.id ?? null;

      if (dto.driverProfile && driverProfileId) {
        const types = dto.driverProfile.driverServiceTypes;
        if (types !== undefined) {
          await tx.driverServiceType.deleteMany({ where: { driverProfileId } });

          if (types.length > 0) {
            const validMoveTypes = ['SMALL_MOVE', 'HOME_MOVE', 'OFFICE_MOVE'];
            const filteredTypes = types.filter((t) => validMoveTypes.includes(t));
            await tx.driverServiceType.createMany({
              data: types.map((t) => ({
                serviceType: t as MoveType,
                driverProfileId,
              })),
            });
          }
        }
      }

      if (dto.driverProfile && driverProfileId) {
        const areas = dto.driverProfile.driverServiceAreas;
        if (areas !== undefined) {
          await tx.driverServiceArea.deleteMany({ where: { driverProfileId } });

          if (areas.length > 0) {
            const validAreas = [
              'SEOUL',
              'GYEONGGI',
              'INCHEON',
              'GANGWON',
              'CHUNGBUK',
              'CHUNGNAM',
              'SEJONG',
              'DAEJEON',
              'JEONBUK',
              'JEONNAM',
              'GWANGJU',
              'GYEONGBUK',
              'GYEONGNAM',
              'DAEGU',
              'ULSAN',
              'BUSAN',
              'JEJU',
            ];
            const filteredAreas = areas.filter((a) => validAreas.includes(a));

            await tx.driverServiceArea.createMany({
              data: areas.map((a) => ({
                serviceArea: a as Area,
                driverProfileId,
              })),
            });
          }
        }
      }

      const result = await tx.user.findUnique({
        where: { id },
        include: {
          driverProfile: {
            include: {
              driverServiceAreas: true,
              driverServiceTypes: true,
            },
          },
          consumerProfile: true,
        },
      });

      return result as PartialUserProfile;
    });

    return updated;
  }
}

export type SocialProfile = {
  provider: string;
  providerId: string;
  email: string;
  name: string;
};
