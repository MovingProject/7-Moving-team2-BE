import { AccessTokenPayload } from '@/shared/jwt/jwt.payload.schema';
import { CreateQuoteRequestBody } from '../dto/create-quote-request.dto';
import { Request } from '@prisma/client';
import { ReceivedRequest } from '../dto/request-quote-request-received.dto';

export interface InviteResult {
  invited: boolean;
  alreadyExisted: boolean;
}

export interface IRequestService {
  createQuoteRequest(createQuoteRequestBody: CreateQuoteRequestBody, user: AccessTokenPayload): Promise<Request>;
  findReceivedByDriverId(driverId: string): Promise<ReceivedRequest[]>;
  inviteToRequest(driverId: string, user: AccessTokenPayload): Promise<InviteResult>;
}

export const REQUEST_SERVICE = 'IRequestService';
