import { Body, Controller, Get, Inject, Param, Post, Query, UseGuards } from '@nestjs/common';

import { AuthUser } from '@/modules/auth/decorators/auth-user.decorator'; // user payload 추출 데코레이터
import { AccessTokenGuard } from '@/modules/auth/guards/accessToken.guard';
import { RolesGuard } from '@/modules/auth/guards/role.guard';
import type { AccessTokenPayload } from '@/shared/jwt/jwt.payload.schema';
import { ZodValidationPipe } from '@/shared/pipes/zod-validation.pipe';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RequireRoles } from '../auth/decorators/roles.decorator';
import { CreateChattingRoomBodyDto, createChattingRoomBodySchema } from './dto/create-chatting-room.dto';
import { GetMessageQueryDto, getMessageQuerySchema } from './dto/get-message-query.dto';
import { RoomIdParamDto, roomIdParamSchema } from './dto/roomIdParam.dto';
import { type IChattingRoomsService, CHATTING_ROOMS_SERVICE } from './interface/chatting-rooms.service.interface';

@Controller('chatting-rooms')
@UseGuards(AccessTokenGuard)
export class ChattingRoomsController {
  constructor(
    @Inject(CHATTING_ROOMS_SERVICE)
    private readonly roomsService: IChattingRoomsService,
  ) {}

  @Post()
  @UseGuards(RolesGuard)
  @ApiTags('ChattingRooms')
  @ApiOperation({
    summary: '채팅방 생성/가져오기 (드라이버 전용, 멱등)',
    description:
      'requestId + consumerId로 1:1 채팅방을 생성하거나, 이미 존재하면 동일 roomId를 반환합니다. ' +
      'driverId는 토큰에서 추출됩니다.',
  })
  @ApiResponse({ status: 201, description: '채팅방 생성 또는 조회 성공' })
  @RequireRoles('DRIVER')
  async createOrGet(
    @AuthUser() user: AccessTokenPayload,
    @Body(new ZodValidationPipe(createChattingRoomBodySchema)) body: CreateChattingRoomBodyDto,
  ) {
    const result = await this.roomsService.createOrGetRoomByDriver(body, user);
    return result;
  }

  @Get(':roomId/messages')
  @UseGuards(AccessTokenGuard)
  @ApiTags('ChattingRooms')
  @ApiOperation({
    summary: '채팅방 메시지 조회',
    description: '채팅방 메시지를 조회합니다.',
  })
  @ApiResponse({ status: 200, description: '채팅방 메시지 조회 성공' })
  async getMessages(
    @Param(new ZodValidationPipe(roomIdParamSchema)) param: RoomIdParamDto,
    @Query(new ZodValidationPipe(getMessageQuerySchema)) query: GetMessageQueryDto,
    @AuthUser() user: AccessTokenPayload,
  ) {
    const result = await this.roomsService.getMessages(
      { roomId: param.roomId, cursor: query.cursor, limit: query.limit },
      user,
    );
    return result;
  }
}
