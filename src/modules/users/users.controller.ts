import { Controller, Get, Param, UseGuards, Res, Patch, Body, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserDtoFactory, EditConsumerProfileDto } from './dto/user.response.dto';
import { NotFoundException } from '@nestjs/common';
import { AccessTokenGuard } from '../auth/guards/accessToken.guard';
import { ApiOkResponse, ApiNotFoundResponse, ApiOperation } from '@nestjs/swagger';
import { AuthUser } from '../auth/decorators/auth-user.decorator';
import type { AccessTokenPayload } from '@/shared/jwt/jwt.payload.schema';
import { UpdateUserProfileDto } from './dto/user.update.dto';
import type { AuthenticatedRequest } from './interface/users.repository.interface';
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Get('me')
  @UseGuards(AccessTokenGuard)
  @ApiOperation({ summary: '유저 프로필 수정시 GET 데이터(유저정보)' })
  @ApiOkResponse({ type: EditConsumerProfileDto })
  @ApiNotFoundResponse({ description: '프로필이 없습니다.' })
  async getProfile(@AuthUser() authUser: AccessTokenPayload, @Res({ passthrough: true }) _res: Response) {
    const user = await this.usersService.getUserWithProfile(authUser.sub);
    if (user.consumerProfile) {
      return UserDtoFactory.toEditConsumerProfileDto(user, user.consumerProfile);
    } else if (user.driverProfile) {
      return UserDtoFactory.toEditDriverProfileDto(
        user,
        user.driverProfile,
        user.driverProfile.driverServiceTypes?.map((t) => t.serviceType),
        user.driverProfile.driverServiceAreas?.map((a) => a.serviceArea),
      );
    } else {
      throw new NotFoundException('프로필이 없습니다.');
    }
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
