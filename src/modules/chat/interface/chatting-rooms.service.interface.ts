import { AccessTokenPayload } from '@/shared/jwt/jwt.payload.schema';

export interface IChattingRoomsService {
  createOrGetRoomByDriver(
    input: {
      requestId: string;
      consumerId: string;
    },
    user: AccessTokenPayload,
  ): Promise<{ roomId: string }>;
}

export const CHATTING_ROOMS_SERVICE = 'IChattingRoomsService';
