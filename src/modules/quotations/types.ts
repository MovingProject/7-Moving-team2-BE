import { MoveType } from '@/shared/constant/values';
import { QuotationStatus } from '@/shared/constant/values';

export type QuotationEntity = {
  id: string;
  consumerId: string;
  driverId: string;
  chattingRoomId: string;
  requestId: string;
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
  price: number;
  status: QuotationStatus;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};
