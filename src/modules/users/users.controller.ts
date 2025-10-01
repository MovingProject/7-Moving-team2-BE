import { Controller, Get, Param, UseGuards, Res, Patch, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserDtoFactory, EditConsumerProfileDto } from './dto/user.response.dto';
import { NotFoundException } from '@nestjs/common';
import { AccessTokenGuard } from '../auth/guards/accessToken.guard';
import { ApiOkResponse, ApiNotFoundResponse, ApiOperation } from '@nestjs/swagger';
import { AuthUser } from '../auth/decorators/auth-user.decorator';
import type { AccessTokenPayload } from '@/shared/jwt/jwt.payload.schema';

import { BaseUpdateUserDto } from './dto/user.update.Dto';
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

  @Patch('me')
  async patchProfile(
    @AuthUser() authUser: AccessTokenPayload,
    @Body() updateUserDto: BaseUpdateUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.usersService.getUserWithProfile(authUser.sub);
    //여기서 일단 기존 db에있는 유저정보를가져옴 그래서 채울수있는곳은 채움
  }
}
