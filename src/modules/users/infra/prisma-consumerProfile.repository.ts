import { PrismaService } from '@/shared/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { TransactionContext } from '@/shared/prisma/transaction-runner.interface';
import { getDb } from '@/shared/prisma/get-db';
import { IConsumerProfileRepository } from '../interface/consumerProfile.repository.interface';
import { ConsumerProfileEntity } from '../types';
import { CreateConsumerProfileBody } from '../dto/createConsumerProfileBodySchema';

@Injectable()
export class PrismaConsumerProfileRepository implements IConsumerProfileRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createConsumerProfile(
    consumerId: string,
    body: CreateConsumerProfileBody,
    ctx?: TransactionContext,
  ): Promise<ConsumerProfileEntity> {
    const db = getDb(ctx, this.prisma);

    return await db.consumerProfile.create({
      data: { consumerId, image: body.image ?? null, serviceType: body.serviceType, areas: body.areas },
    });
  }
}
