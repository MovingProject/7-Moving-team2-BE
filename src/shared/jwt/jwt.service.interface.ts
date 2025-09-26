import { AccessTokenPayload, JwtPayload } from './jwt.payload.schema';

export interface IJwtService {
  signAccessToken(payload: AccessTokenPayload): Promise<string>;
  signRefreshToken(payload: JwtPayload): Promise<string>;
  verifyAccessToken<T extends AccessTokenPayload = AccessTokenPayload>(token: string): Promise<T>;
  verifyRefreshToken<T extends JwtPayload = JwtPayload>(token: string): Promise<T>;
}

export const JWT_SERVICE = 'IJwtService';
