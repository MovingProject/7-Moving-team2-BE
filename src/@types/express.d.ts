import type { AccessTokenPayload, JwtPayload } from '@/shared/jwt/jwt.payload.schema';

declare global {
  namespace Express {
    export interface Request {
      user?: AccessTokenPayload;
      refresh?: JwtPayload;
      refreshRaw?: string;
    }
  }
}
