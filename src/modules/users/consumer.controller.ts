import { type AccessTokenPayload } from '@/shared/jwt/jwt.payload.schema';
import { ZodValidationPipe } from '@/shared/pipes/zod-validation.pipe';
import { Body, Controller, Get, Inject, Post, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthUser } from '../auth/decorators/auth-user.decorator';
import { RequireRoles } from '../auth/decorators/roles.decorator';
import { AccessTokenGuard } from '../auth/guards/accessToken.guard';
import { RolesGuard } from '../auth/guards/role.guard';
import { CreateConsumerProfileBodyDto, createConsumerProfileBodySchema } from './dto/createConsumerProfileBodySchema';
import { getLikedDriversQuerySchema, GetLikedDriversQuerySchemaDto } from './dto/getLikedDriversQuerySchema';
import { CONSUMER_SERVICE, type IConsumerService } from './interface/consumer.service.interface';

@ApiTags('Consumer')
@Controller('consumers')
export class ConsumerController {
  constructor(@Inject(CONSUMER_SERVICE) private readonly consumerService: IConsumerService) {}

  @Post('profile')
  @ApiOperation({ summary: '소비자 프로필 등록' })
  @ApiResponse({ status: 201, description: '소비자 프로필 등록 성공' })
  @ApiResponse({ status: 401, description: '미인증' })
  @ApiResponse({ status: 403, description: '권한 불일치' })
  @ApiResponse({ status: 409, description: '이미 등록된 프로필' })
  @UseGuards(AccessTokenGuard, RolesGuard)
  @RequireRoles('CONSUMER')
  async createProfile(
    @AuthUser() user: AccessTokenPayload,
    @Body(new ZodValidationPipe(createConsumerProfileBodySchema)) body: CreateConsumerProfileBodyDto,
  ) {
    return this.consumerService.createConsumerProfile(user.sub, body);
  }

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
