import type { Prisma } from '@prisma/client';
import { PrismaService } from './prisma.service';
import { TransactionContext } from './transaction-runner.interface';

export type Db = Prisma.TransactionClient | PrismaService;

export function getDb(ctx: TransactionContext | undefined, prisma: PrismaService): Db {
  return (ctx?.tx as Prisma.TransactionClient) ?? prisma;
}
