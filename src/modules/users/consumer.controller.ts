import { type AccessTokenPayload } from '@/shared/jwt/jwt.payload.schema';
import { Controller, Get, Inject, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthUser } from '../auth/decorators/auth-user.decorator';
import { AccessTokenGuard } from '../auth/guards/accessToken.guard';
import { RolesGuard } from '../auth/guards/role.guard';
import { CONSUMER_SERVICE, type IConsumerService } from './interface/consumer.service.interface';
import { RequireRoles } from '../auth/decorators/roles.decorator';
import { Query } from '@nestjs/common';
import { ZodValidationPipe } from '@/shared/pipes/zod-validation.pipe';
import { getLikedDriversQuerySchema, GetLikedDriversQuerySchemaDto } from './dto/getLikedDriversQuerySchema';
@ApiTags('Consumer')
@Controller('consumers')
export class ConsumerController {
  constructor(@Inject(CONSUMER_SERVICE) private readonly consumerService: IConsumerService) {}

  @Get('liked-drivers')
  @ApiOperation({ summary: '내가 좋아요한 기사 목록 조회 (cursor 기반)' })
  @ApiQuery({
    name: 'cursor',
    type: 'string',
    required: false,
    description: '커서(Base64: likedAt|id). 없으면 첫 페이지',
  })
  @ApiQuery({
    name: 'limit',
    type: Number,
    required: false,
    description: '가져올 개수(기본 10, 최대 50, 초과 시 50으로 클램프)',
  })
  @ApiResponse({ status: 200, description: '드라이버 리스트 조회 성공' })
  @ApiResponse({ status: 401, description: '미인증' })
  @ApiResponse({ status: 403, description: '권한 불일치' })
  @UseGuards(AccessTokenGuard, RolesGuard)
  @RequireRoles('CONSUMER')
  async getLikedDrivers(
    @AuthUser() user: AccessTokenPayload,
    @Query(new ZodValidationPipe(getLikedDriversQuerySchema)) query: GetLikedDriversQuerySchemaDto,
  ) {
    return this.consumerService.getLikedDriverList(user.sub, query);
  }
}
