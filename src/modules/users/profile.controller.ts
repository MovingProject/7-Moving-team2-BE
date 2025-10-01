import { BadRequestException, Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Area, MoveType } from '@prisma/client';
import { ProfileRepository } from './infra/profile.repository';
import { AccessTokenGuard } from '@/modules/auth/guards/accessToken.gaurd';
import { AuthUser } from '@/modules/auth/decorators/auth-user.decorator';
import type { AccessTokenPayload } from '@/shared/jwt/jwt.payload.schema';
import { CreateConsumerProfileDto } from './dto/createConsumerProfile.dto';
import { CreateDriverProfileDto } from './dto/createDriverProfile.dto';

@ApiTags('소비자 프로필 생성')
@Controller('profiles')
export class ProfileController {
  constructor(private readonly repo: ProfileRepository) {}

  // 소비자 프로필 생성

  @Post('consumer')
  @ApiOperation({ summary: '소비자 프로필 생성' })
  @ApiResponse({ status: 201, description: '생성 성공' })
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AccessTokenGuard)
  async createConsumer(@AuthUser() user: AccessTokenPayload, @Body() dto: CreateConsumerProfileDto) {
    if (!user?.sub) throw new BadRequestException('사용자 정보가 필요합니다');
    if (!dto.serviceType || !('area' in dto) || !dto.area) {
      throw new BadRequestException('serviceType, area 필수입니다.');
    }

    return this.repo.createConsumerProfile(user.sub, dto.image ?? null, dto.serviceType, dto.areas);
  }

  // 기사 프로필 생성
  @Post('driver')
  @ApiOperation({ summary: '기사 프로필 생성' })
  @ApiResponse({ status: 201, description: '생성 성공' })
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AccessTokenGuard)
  async createDriver(@AuthUser() user: AccessTokenPayload, @Body() dto: CreateDriverProfileDto) {
    if (!user?.sub) throw new BadRequestException('사용자 정보가 필요합니다');
    if (!dto.nickname) throw new BadRequestException('nickname 필수입니다.');

    return this.repo.createDriverProfile(
      user.sub, // driverId (JWT sub)
      dto.image ?? null, // image
      dto.nickname, // nickname
      String(dto.careerYears ?? '0'), // careerYears (string 스키마)
      dto.oneLiner ?? '', // oneLiner
      dto.description ?? '', // description
      (dto.serviceTypes ?? []) as MoveType[], // serviceTypes
      (dto.serviceAreas ?? []) as Area[], // serviceAreas
    );
  }
}
