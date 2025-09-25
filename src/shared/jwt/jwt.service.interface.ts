import { Role } from '@prisma/client';

export interface JwtPayload {
  sub: string;
}

export interface AccessTokenPayload extends JwtPayload {
  role: Role;
}

export interface IJwtService {
  signAccessToken(payload: AccessTokenPayload): Promise<string>;
  signRefreshToken(payload: JwtPayload): Promise<string>;
  verifyAsync<T extends JwtPayload = JwtPayload>(token: string): Promise<T>;
}

export const JWT_SERVICE = 'IJwtService';
