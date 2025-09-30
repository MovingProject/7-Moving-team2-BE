import { MoveType, Area, ConsumerProfile, DriverProfile } from '@prisma/client';

export interface IProfileRepository {
  createConsumerProfile(
    consumerId: string,
    image: string,
    serviceType: MoveType,
    areas: Area,
  ): Promise<ConsumerProfile>;

  createDriverProfile(
    driverId: string,
    image: string | null,
    nickname: string,
    careerYears: string,
    oneLiner: string,
    description: string,
    serviceType: MoveType[],
    areas: Area[],
  ): Promise<DriverProfile>;
}
