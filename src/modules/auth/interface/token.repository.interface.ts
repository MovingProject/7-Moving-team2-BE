import { TransactionContext } from "@/shared/prisma/transaction-runner.interface";

export interface RefreshTokenEntity {
  id: string;
  jti: string;
  tokenHash: string;
  userId: string;
  expiresAt: Date;
  usedAt: Date | null;
  createdAt: Date;
}

export interface ITokenRepository {
  saveRefreshToken(
    userId: string,
    tokenHash: string,
    jti: string,
    expiresAt: Date,
    ctx?: TransactionContext,
  ): Promise<RefreshTokenEntity>;

  findTokenByHash(tokenHash: string): Promise<RefreshTokenEntity | null>;

  findTokenByJti(jti: string): Promise<RefreshTokenEntity | null>;

  markTokenAsUsed(tokenId: string): Promise<void>;

  deleteTokenByJti(jti: string): Promise<void>;
}

export const TOKEN_REPOSITORY = 'ITokenRepository';
