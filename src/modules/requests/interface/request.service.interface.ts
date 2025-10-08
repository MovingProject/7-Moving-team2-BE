import { AccessTokenPayload } from '@/shared/jwt/jwt.payload.schema';
import { CreateQuoteRequestBody } from '../dto/create-quote-request.dto';
import { Request } from '@prisma/client';

export interface IRequestService {
  createQuoteRequest(createQuoteRequestBody: CreateQuoteRequestBody, user: AccessTokenPayload): Promise<Request>;
}

export const REQUEST_SERVICE = 'IRequestService';
