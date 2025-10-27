import { Body, Controller, Inject, Post, UseGuards } from '@nestjs/common';

import { AuthUser } from '@/modules/auth/decorators/auth-user.decorator'; // user payload 추출 데코레이터
import { AccessTokenGuard } from '@/modules/auth/guards/accessToken.guard';
import { RolesGuard } from '@/modules/auth/guards/role.guard';
import type { AccessTokenPayload } from '@/shared/jwt/jwt.payload.schema';
import { ZodValidationPipe } from '@/shared/pipes/zod-validation.pipe';
import { CreateChattingRoomBodyDto, createChattingRoomBodySchema } from './dto/create-chatting-room.dto';
import { type IChattingRoomsService, CHATTING_ROOMS_SERVICE } from './interface/chatting-rooms.service.interface';
import { RequireRoles } from '../auth/decorators/roles.decorator';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

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
}
