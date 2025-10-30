import { MoveType } from '@/shared/constant/values';
import { TransactionContext } from '@/shared/prisma/transaction-runner.interface';
import { QuotationStatus } from '@prisma/client';
import { QuotationWithRelations } from '../dto/quotation-list.dto';
import { QuotationEntity } from '../types';

export type CreateQuotationInput = {
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
  additionalRequirements?: string | null;
  price: number;
  previousQuotationId?: string | null;
  validUntil?: Date | null;
  chattingMessageId: string;
};
export interface IQuotationRepository {
  findDriverQuotations(driverId: string, statuses: QuotationStatus[]): Promise<QuotationWithRelations[]>;
  create(input: CreateQuotationInput, ctx?: TransactionContext): Promise<QuotationEntity>;
}

export const QUOTATION_REPOSITORY = 'IQuotationRepository';
