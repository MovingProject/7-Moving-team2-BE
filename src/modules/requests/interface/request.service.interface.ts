import { AccessTokenPayload } from '@/shared/jwt/jwt.payload.schema';
import { CreateQuoteRequestBody } from '../dto/create-quote-request.dto';
import { DriverRequestAction, Request } from '@prisma/client';
import { ReceivedRequest } from '../dto/request-quote-request-received.dto';
import { ReceivedRequestFilter } from '../dto/request-filter-post.dto';
import { DriverRequestActionDTO } from '../dto/request-reject-request-received.dto';
import { RequestListDto } from '../dto/request-list.dto';
import { RequestCheckResponseDto } from '../dto/request-check.dto';

export interface InviteResult {
  invited: boolean;
  alreadyExisted: boolean;
}

export interface IRequestService {
  createQuoteRequest(createQuoteRequestBody: CreateQuoteRequestBody, user: AccessTokenPayload): Promise<Request>;
  findReceivedByDriverId(driverId: string): Promise<ReceivedRequest[]>;
  inviteToRequest(driverId: string, user: AccessTokenPayload): Promise<InviteResult>;
  filterReceivedRequests(driverId: string, filter: ReceivedRequestFilter): Promise<ReceivedRequest[]>;
  countRequests(driverId: string): Promise<{
    HOME_MOVE: number;
    SMALL_MOVE: number;
    OFFICE_MOVE: number;
    INVITED: number;
    AREA: number;
  }>;
  rejectRequest(driverId: string, dto: DriverRequestActionDTO): Promise<DriverRequestAction>;
  getConsumerRequests(consumerId: string): Promise<RequestListDto[]>;
  checkPendingRequest(consumerId: string): Promise<RequestCheckResponseDto>;
  getRequestById(requestId: string): Promise<Request>;
}

export const REQUEST_SERVICE = 'IRequestService';
