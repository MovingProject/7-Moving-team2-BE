import { AccessTokenPayload } from '@/shared/jwt/jwt.payload.schema';

type LikeDriverResult = { liked: true } | { liked: false; message: 'Already liked' };
type UnlikeDriverResult = { unliked: true } | { unliked: false; message: 'Already unliked' };

export interface IDriverService {
  likeDriver(driverId: string, user: AccessTokenPayload): Promise<LikeDriverResult>;
  unlikeDriver(driverId: string, user: AccessTokenPayload): Promise<UnlikeDriverResult>;
}

export const DRIVER_SERVICE = 'IDriverService';
