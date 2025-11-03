import { PrismaService } from '@/shared/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { ITokenRepository, RefreshTokenEntity } from '../interface/token.repository.interface';
import { TransactionContext } from '@/shared/prisma/transaction-runner.interface';
import { getDb } from '@/shared/prisma/get-db';

@Injectable()
export class PrismaTokenRepository implements ITokenRepository {
  constructor(private readonly prisma: PrismaService) {}

  async saveRefreshToken(
    userId: string,
    tokenHash: string,
    jti: string,
    expiresAt: Date,
    ctx?: TransactionContext,
  ): Promise<RefreshTokenEntity> {
    const db = getDb(ctx, this.prisma);
    return await db.refreshToken.create({
      data: {
        userId,
        tokenHash,
        jti,
        expiresAt,
      },
    });
  }

  async findTokenByHash(tokenHash: string): Promise<RefreshTokenEntity | null> {
    return await this.prisma.refreshToken.findFirst({
      where: {
        tokenHash,
      },
    });
  }

  async findTokenByJti(jti: string): Promise<RefreshTokenEntity | null> {
    return await this.prisma.refreshToken.findUnique({
      where: {
        jti,
      },
    });
  }

  async markTokenAsUsed(tokenId: string): Promise<void> {
    await this.prisma.refreshToken.update({
      where: { id: tokenId },
      data: { usedAt: new Date() },
    });
    return;
  }

  async deleteTokenByJti(jti: string): Promise<void> {
    await this.prisma.refreshToken.delete({
      where: { jti },
    });
    return;
  }
}
