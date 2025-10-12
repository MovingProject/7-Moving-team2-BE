import { AccessTokenPayload } from '@/shared/jwt/jwt.payload.schema';
import { CreateQuoteRequestBody } from '../dto/create-quote-request.dto';
import { Request } from '@prisma/client';
import { ReceivedRequest } from '../dto/request-quote-request-received.dto';
export interface IRequestService {
  createQuoteRequest(createQuoteRequestBody: CreateQuoteRequestBody, user: AccessTokenPayload): Promise<Request>;
  findReceivedByDriverId(driverId: string): Promise<ReceivedRequest[]>;
}

export const REQUEST_SERVICE = 'IRequestService';
