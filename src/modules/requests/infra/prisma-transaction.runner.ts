import { ITransactionRunner, TransactionContext } from '@/shared/prisma/transaction-runner.interface';
import { PrismaClient } from '@prisma/client';

export class PrismaTransactionRunner implements ITransactionRunner {
  constructor(private prisma: PrismaClient) {}

  async run<T>(callback: (ctx: TransactionContext) => Promise<T>): Promise<T> {
    return this.prisma.$transaction(async (tx) => {
      const ctx: TransactionContext = { tx };
      return callback(ctx);
    });
  }
}
