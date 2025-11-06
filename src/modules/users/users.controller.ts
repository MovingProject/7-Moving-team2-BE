import type { AccessTokenPayload } from '@/shared/jwt/jwt.payload.schema';
import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOperation } from '@nestjs/swagger';
import { AuthUser } from '../auth/decorators/auth-user.decorator';
import { AccessTokenGuard } from '../auth/guards/accessToken.guard';
import { UpdateUserProfileDto } from './dto/user.update.dto';
import type { AuthenticatedRequest } from './interface/users.repository.interface';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(AccessTokenGuard)
  @ApiOperation({ summary: '유저 프로필 수정시 GET 데이터(유저정보)' })
  @ApiNotFoundResponse({ description: '프로필이 없습니다.' })
  async getProfile(@AuthUser() authUser: AccessTokenPayload) {
    const user = await this.usersService.getUserwithFullProfile(authUser.sub);
    return user;
  }

  @Patch('me/profile')
  @UseGuards(AccessTokenGuard)
  async updateProfile(
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdateUserProfileDto, // 프로필 수정 + 비밀번호 변경 포함
  ) {
    const userId = req.user.sub;
    return this.usersService.updateProfile(userId, dto);
  }
}
