import { CreateRequestData, RequestEntity } from '../types';
import { ReceivedRequest } from '../dto/request-quote-request-received.dto';
import { TransactionContext } from '@/shared/prisma/transaction-runner.interface';

import { ReceivedRequestFilter } from '../dto/request-filter-post.dto';
import { DriverRequestActionDTO } from '../dto/request-reject-request-received.dto';
import { DriverRequestAction, Invite, User, Request as PrismaRequest, PrismaClient } from '@prisma/client';
export interface IRequestRepository {
  findPendingByConsumerId(consumerId: string, ctx?: TransactionContext): Promise<RequestEntity | null>;
  createRequest(data: CreateRequestData): Promise<RequestEntity>;
  findInvitesByDriverId(driverId: string): Promise<ReceivedRequest[]>;
  incrementInvitedCountIfAvailable(requestId: string, ctx?: TransactionContext): Promise<boolean>;
  filterRequests(driverId: string, filter: ReceivedRequestFilter): Promise<ReceivedRequest[]>;
  countRequests(driverId: string): Promise<{
    HOME_MOVE: number;
    SMALL_MOVE: number;
    OFFICE_MOVE: number;
    INVITED: number;
    AREA: number;
  }>;
  createDriverAction(tx: PrismaClient, data: DriverRequestActionDTO): Promise<DriverRequestAction>;
  findById(requestId: string): Promise<(PrismaRequest & { consumer: User; invites: Invite[] }) | null>;
  findPendingByConsumerId(consumerId: string): Promise<{ id: string } | null>;
}

export const REQUEST_REPOSITORY = 'IRequestRepository';
