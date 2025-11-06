import { CreateRequestData, RequestEntity } from '../types';
import { ReceivedRequest } from '../dto/request-quote-request-received.dto';
import { TransactionContext } from '@/shared/prisma/transaction-runner.interface';

import { ReceivedRequestFilter } from '../dto/request-filter-post.dto';
import { DriverRequestActionDTO } from '../dto/request-reject-request-received.dto';
import { DriverRequestAction, Invite, User, Request as PrismaRequest, PrismaClient, Quotation } from '@prisma/client';

export interface IRequestWithRelations extends PrismaRequest {
  quotations: (Quotation & {
    driver: {
      driverProfile: {
        nickname: string;
        oneLiner: string | null;
        likeCount: number;
        reviewCount: number;
        rating: number;
        careerYears: number;
        confirmedCount: number;
        image: string | null;
      } | null;
    };
  })[];
  invites: Invite[];
}

export type DriverReceivedRequestFilter = Omit<ReceivedRequestFilter, 'status'> & {
  status: 'PENDING';
};

export interface IRequestRepository {
  findPendingRequestById(requestId: string, ctx?: TransactionContext): Promise<RequestEntity | null>;
  findPendingByConsumerId(consumerId: string, ctx?: TransactionContext): Promise<RequestEntity | null>;
  createRequest(data: CreateRequestData): Promise<RequestEntity>;
  findInvitesByDriverId(driverId: string): Promise<ReceivedRequest[]>;
  incrementInvitedCountIfAvailable(requestId: string, ctx?: TransactionContext): Promise<boolean>;
  filterRequests(driverId: string, filter: DriverReceivedRequestFilter): Promise<ReceivedRequest[]>;
  countRequests(driverId: string): Promise<{
    HOME_MOVE: number;
    SMALL_MOVE: number;
    OFFICE_MOVE: number;
    INVITED: number;
    AREA: number;
  }>;
  createDriverAction(tx: PrismaClient, data: DriverRequestActionDTO): Promise<DriverRequestAction>;
  findAllByConsumerId(consumerId: string): Promise<IRequestWithRelations[]>;
  findById(
    requestId: string,
    ctx?: TransactionContext,
  ): Promise<(PrismaRequest & { consumer: User; invites: Invite[] }) | null>;
  findById(requestId: string): Promise<(PrismaRequest & { consumer: User; invites: Invite[] }) | null>;
  findPendingByConsumerId(consumerId: string): Promise<{ id: string } | null>;
}

export const REQUEST_REPOSITORY = 'IRequestRepository';
