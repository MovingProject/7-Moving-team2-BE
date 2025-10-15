import { AccessTokenPayload } from '@/shared/jwt/jwt.payload.schema';
import { CreateQuoteRequestBody } from '../dto/create-quote-request.dto';
import { Request } from '@prisma/client';
import { ReceivedRequest } from '../dto/request-quote-request-received.dto';
import { ReceivedRequestFilter } from '../dto/request-filter-post.dto';

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
}

export const REQUEST_SERVICE = 'IRequestService';
