import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  CHATTING_ROOMS_REPOSITORY,
  type IChattingRoomsRepository,
} from '../interface/chatting-rooms.repository.interface';
import type { WsSocket } from './ws.types';
import { fail, ok } from './ws.ack';

@Injectable()
export class ChatRoomWsService {
  private readonly logger = new Logger(ChatRoomWsService.name);

  constructor(
    @Inject(CHATTING_ROOMS_REPOSITORY)
    private readonly roomsRepo: IChattingRoomsRepository,
  ) {}

  async joinRoom(client: WsSocket, roomId: string) {
    const user = client.data.user;
    if (!user) return fail('AUTH_REQUIRED', '로그인이 필요합니다.');

    const room = await this.roomsRepo.findById(roomId);
    if (!room || room.deletedAt) return fail('ROOM_NOT_FOUND', '대화방이 없습니다.');
    if (room.closedAt) return fail('JOIN_DENIED', '종료된 대화방입니다.');
    if (room.consumerId !== user.id && room.driverId !== user.id)
      return fail('JOIN_DENIED', '이 방에 참여할 수 없습니다.');

    const key = `room:${roomId}`;
    if (!client.rooms.has(key)) {
      await client.join(key);
      this.logger.debug(`socket ${client.id} joined ${key}`);
    }

    return ok({ roomId, joinedAt: new Date().toISOString() });
  }
}
