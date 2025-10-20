import type { AccessTokenPayload, JwtPayload } from '@/shared/jwt/jwt.payload.schema';

declare global {
  namespace Express {
    export interface Request {
      user?: AccessTokenPayload | null;
      refresh?: JwtPayload;
      refreshRaw?: string;
    }
  }
}
