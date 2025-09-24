import { Area, ConsumerProfile, DriverProfile, MoveType } from '@prisma/client';

export type ConsumerProfileCreateInput = {
  userId: string;
  image?: string;
  moveTypes?: MoveType;
  areas?: Area[];
};

export type DriverProfileCreateInput = {
  userId: string;
  image?: string;
  nickname: string;
  careerYears?: number;
  oneLiner?: string;
  description?: string;
  serviceAreas?: Area[];
  moveType?: MoveType[];
};

export type ConsumerProfileEntity = ConsumerProfile;
export type DriverProfileEntity = DriverProfile & {
  serviceAreas: { area: Area }[];
  moveType: { moveType: MoveType }[];
};
