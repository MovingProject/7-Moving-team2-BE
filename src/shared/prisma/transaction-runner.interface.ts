export interface TransactionContext {
  readonly tx: unknown; // Prisma 타입 감춤(서비스/도메인에서 Prisma 모르게)
}

export interface ITransactionRunner {
  run<T>(callback: (ctx: TransactionContext) => Promise<T>): Promise<T>;
}

export const TRANSACTION_RUNNER = 'ITransactionRunner';
