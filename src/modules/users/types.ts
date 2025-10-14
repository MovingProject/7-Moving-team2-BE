import { Role, MoveType, Area } from '@/shared/constant/values';

export interface userEntity {
  id: string;
  name: string;
  email: string;
  passwordHash: string | null;
  phoneNumber: string;
  role: Role;
  providerId: string | null;
  provider: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface DriverProfileEntity {
  id: string;
  userId: string;
  image: string | null;
  nickname: string;
  careerYears: string;
  oneLiner: string;
  description: string;
  likeCount: number;
  rating: number;
  reviewCount: number;
  confirmedCount: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  driverServiceAreas: driverServiceAreaEntity[];
  driverServiceTypes: driverServiceTypeEntity[];
}

export interface ConsumerProfileEntity {
  id: string;
  consumerId: string;
  image: string | null;
  serviceType: MoveType;
  areas: Area;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface driverServiceAreaEntity {
  id: string;
  driverProfileId: string;
  serviceArea: Area;
}

export interface driverServiceTypeEntity {
  id: string;
  driverProfileId: string;
  serviceType: MoveType;
}

export interface likeEntity {
  id: string;
  consumerId: string;
  driverId: string;
  likedAt: Date;
}
