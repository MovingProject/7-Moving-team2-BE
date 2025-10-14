import { type Area, type MoveType, type RequestStatus } from '@/shared/constant/values';

export interface RequestEntity {
  id: string;
  consumerId: string;
  serviceType: MoveType;
  moveAt: Date;
  departureAddress: string;
  departureFloor: number;
  departurePyeong: number;
  departureElevator: boolean;
  arrivalAddress: string;
  arrivalFloor: number;
  arrivalPyeong: number;
  arrivalElevator: boolean;
  additionalRequirements: string | null;
  departureArea: Area;
  arrivalArea: Area;
  requestStatus: RequestStatus;
  generalQuoteCount: number;
  invitedQuoteCount: number;
  generalQuoteLimit: number;
  invitedQuoteLimit: number;
  createdAt: Date;
  updatedAt: Date;
  concludedAt: Date | null;
  completedAt: Date | null;
  expiredAt: Date | null;
  canceledAt: Date | null;
  withdrawnAt: Date | null;
  deletedAt: Date | null;
}

export interface CreateRequestData {
  consumerId: string;
  serviceType: MoveType;
  moveAt: Date;
  departureAddress: string;
  departureFloor: number;
  departurePyeong: number;
  departureElevator: boolean;
  arrivalAddress: string;
  arrivalFloor: number;
  arrivalPyeong: number;
  arrivalElevator: boolean;
  additionalRequirements?: string;
  departureArea: Area;
  arrivalArea: Area;
}

export interface InviteEntity {
  id: string;
  requestId: string;
  driverId: string;
  createdAt: Date;
  canceledAt: Date | null;
}
