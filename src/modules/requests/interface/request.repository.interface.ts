import { CreateRequestData, RequestEntity } from '../types';

export interface IRequestRepository {
  findPendingByConsumerId(consumerId: string): Promise<RequestEntity | null>;
  createRequest(data: CreateRequestData): Promise<RequestEntity>;
}

export const REQUEST_REPOSITORY = 'IRequestRepository';
