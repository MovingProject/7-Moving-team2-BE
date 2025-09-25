export interface RefreshTokenEntity {
  id: string;
  tokenHash: string;
  userId: string;
  expiresAt: Date;
  usedAt: Date | null;
  createdAt: Date;
}

export interface ITokenRepository {
  saveRefreshToken(userId: string, tokenHash: string, expiresAt: Date): Promise<RefreshTokenEntity>;

  findTokenByHash(tokenHash: string): Promise<RefreshTokenEntity | null>;

  markTokenAsUsed(tokenId: string): Promise<void>;

  deleteTokensByUserId(userId: string): Promise<void>;
}

export const TOKEN_REPOSITORY = 'ITokenRepository';
