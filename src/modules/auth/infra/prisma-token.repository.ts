import { ITokenRepository, RefreshTokenEntity } from '../interface/token.repository.interface';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PrismaTokenRepository implements ITokenRepository {
  constructor(private readonly prisma: PrismaService) {}

  async saveRefreshToken(userId: string, tokenHash: string, expiresAt: Date): Promise<RefreshTokenEntity> {
    return await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
      },
    });
  }

  async findTokenByHash(tokenHash: string): Promise<RefreshTokenEntity | null> {
    return await this.prisma.refreshToken.findFirst({
      where: {
        tokenHash,
        usedAt: null,
        expiresAt: { gt: new Date() },
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

  async deleteTokensByUserId(userId: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });
    return;
  }
}
