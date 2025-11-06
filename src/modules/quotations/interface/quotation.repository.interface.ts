import { MoveType } from '@/shared/constant/values';
import { TransactionContext } from '@/shared/prisma/transaction-runner.interface';
import { Quotation, QuotationStatus } from '@prisma/client';
import { QuotationWithRelations, QuotationWithRelationsPlusId } from '../dto/quotation-list.dto';
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
  findDriverQuotations(
    driverId: string,
    statuses: QuotationStatus[],
    ctx?: TransactionContext,
  ): Promise<QuotationWithRelations[]>;
  findConsumerQuotations(consumerId: string, statuses: QuotationStatus[], ctx?: TransactionContext): Promise<any[]>;
  upsertForRequestDriver(input: CreateQuotationInput, ctx?: TransactionContext): Promise<QuotationEntity>;
  acceptQuotation(id: string, ctx?: TransactionContext): Promise<Quotation>;
  rejectOtherQuotations(requestId: string, excludeQuotationId: string, ctx?: TransactionContext): Promise<void>;
  findById(id: string, ctx?: TransactionContext): Promise<QuotationWithRelationsPlusId | null>;
  updateStatus(id: string, status: QuotationStatus, ctx?: TransactionContext): Promise<Quotation>;
  findUncompletedAfterNow(ctx?: TransactionContext): Promise<Quotation[]>;
}

export const QUOTATION_REPOSITORY = 'IQuotationRepository';
