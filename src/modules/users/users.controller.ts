import { Controller, Get, Param, UseGuards, Res } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserDtoFactory, EditConsumerProfileDto } from './dto/user.response.dto';
import { NotFoundException } from '@nestjs/common';
import { AccessTokenGuard } from '../auth/guards/accessToken.gaurd';
import { ApiOkResponse, ApiNotFoundResponse, ApiOperation } from '@nestjs/swagger';
import { AuthUser } from '../auth/decorators/auth-user.decorator';
import type { AccessTokenPayload } from '@/shared/jwt/jwt.payload.schema';
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Get('me')
  @UseGuards(AccessTokenGuard)
  @ApiOperation({ summary: '유저 프로필 수정시 GET 데이터(유저정보)' })
  @ApiOkResponse({ type: EditConsumerProfileDto })
  @ApiNotFoundResponse({ description: '프로필이 없습니다.' })
  async getProfile(@AuthUser() authUser: AccessTokenPayload, @Res({ passthrough: true }) res: Response) {
    console.log('AuthUser payload:', authUser);
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
}
