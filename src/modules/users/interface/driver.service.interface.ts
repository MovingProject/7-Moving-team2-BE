import { AccessTokenPayload } from '@/shared/jwt/jwt.payload.schema';

type LikeDriverResult = { liked: true } | { liked: false; message: 'Already liked' };

export interface IDriverService {
  likeDriver(driverId: string, user: AccessTokenPayload): Promise<LikeDriverResult>;
}

export const DRIVER_SERVICE = 'IDriverService';
