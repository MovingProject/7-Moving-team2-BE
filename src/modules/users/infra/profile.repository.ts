import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { ConsumerProfile, DriverProfile, Area, MoveType } from '@prisma/client';
import { IProfileRepository } from '../interface/profile.interface';

@Injectable()
export class ProfileRepository implements IProfileRepository {
  constructor(private readonly prisma: PrismaService) {}

  //새로운 소비자 프로필을 생성합니다.

  async createConsumerProfile(
    consumerId: string,
    image: string | null,
    serviceType: MoveType,
    areas: Area,
  ): Promise<ConsumerProfile> {
    return this.prisma.consumerProfile.create({
      data: {
        consumerId,
        image,
        serviceType,
        areas,
      },
    });
  }

  //새로운 기사님 프로필을 생성합니다.

  async createDriverProfile(
    driverId: string,
    image: string | null,
    nickname: string,
    careerYears: string,
    oneLiner: string,
    description: string,
    serviceTypes: MoveType[],
    serviceAreas: Area[],
  ): Promise<DriverProfile> {
    return this.prisma.driverProfile.create({
      data: {
        userId: driverId,
        nickname,
        image,
        careerYears,
        oneLiner,
        description,

        driverServiceAreas:
          serviceAreas && serviceAreas.length > 0
            ? {
                createMany: {
                  data: serviceAreas.map((area) => ({ serviceArea: area })),
                },
              }
            : undefined,

        driverServiceTypes:
          serviceTypes && serviceTypes.length > 0
            ? {
                createMany: {
                  data: serviceTypes.map((type) => ({ serviceType: type })),
                },
              }
            : undefined,
      },
      include: {
        driverServiceAreas: true,
        driverServiceTypes: true,
      },
    });
  }
}
