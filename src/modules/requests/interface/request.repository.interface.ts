import { CreateRequestData, RequestEntity } from '../types';
import { ReceivedRequest } from '../dto/request-quote-request-received.dto';
export interface IRequestRepository {
  findPendingByConsumerId(consumerId: string): Promise<RequestEntity | null>;
  createRequest(data: CreateRequestData): Promise<RequestEntity>;
  findInvitesByDriverId(driverId: string): Promise<ReceivedRequest[]>;
}

export const REQUEST_REPOSITORY = 'IRequestRepository';
