import { TransactionContext } from '@/shared/prisma/transaction-runner.interface';
import { ConsumerProfileEntity } from '../types';
import { CreateConsumerProfileBody } from '../dto/createConsumerProfileBodySchema';

export interface IConsumerProfileRepository {
  createConsumerProfile(
    consumerId: string,
    body: CreateConsumerProfileBody,
    ctx?: TransactionContext,
  ): Promise<ConsumerProfileEntity>;
}

export const CONSUMER_PROFILE_REPOSITORY = 'IConsumerProfileRepository';
