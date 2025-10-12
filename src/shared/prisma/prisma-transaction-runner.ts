import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { ITransactionRunner, TransactionContext } from './transaction-runner.interface';
import type { Prisma } from '@prisma/client';

@Injectable()
export class PrismaTransactionRunner implements ITransactionRunner {
  constructor(private readonly prisma: PrismaService) {}

  async run<T>(callback: (ctx: TransactionContext) => Promise<T>): Promise<T> {
    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const ctx: TransactionContext = { tx };
      return callback(ctx);
    });
  }
}
