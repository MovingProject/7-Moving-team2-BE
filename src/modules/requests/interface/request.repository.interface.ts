import { CreateRequestData, RequestEntity } from '../types';
import { ReceivedRequest } from '../dto/request-quote-request-received.dto';
import { TransactionContext } from '@/shared/prisma/transaction-runner.interface';

export interface IRequestRepository {
  findPendingByConsumerId(consumerId: string, ctx?: TransactionContext): Promise<RequestEntity | null>;
  createRequest(data: CreateRequestData): Promise<RequestEntity>;
  findInvitesByDriverId(driverId: string): Promise<ReceivedRequest[]>;
  incrementInvitedCountIfAvailable(requestId: string, ctx?: TransactionContext): Promise<boolean>;
}

export const REQUEST_REPOSITORY = 'IRequestRepository';
