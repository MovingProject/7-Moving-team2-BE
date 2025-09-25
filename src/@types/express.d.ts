import { Role } from '@prisma/client';

declare global {
  namespace Express {
    export interface Request {
      user?: {
        sub: string;
        jti: string;
        role: Role;
      };
    }
  }
}
