import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserDtoFactory, EditConsumerProfileDto } from './dto/user.response.dto';
import { NotFoundException } from '@nestjs/common';
import { AccessTokenGuard } from '../auth/guards/accessToken.gaurd';
import { ApiOkResponse, ApiNotFoundResponse, ApiOperation } from '@nestjs/swagger';
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @UseGuards(AccessTokenGuard) // 인증하는거라는데 아직까지는 잘모르겠음 이렇게하면되나?
  @Get(':id')
  @ApiOperation({ summary: '유저 프로필 수정시 GET 데이터(유저정보)' })
  @ApiOkResponse({ type: EditConsumerProfileDto })
  @ApiNotFoundResponse({ description: '프로필이 없습니다.' })
  async getProfile(@Param('id') userId: string) {
    const user = await this.usersService.getUserWithProfile(userId);

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
//여기서 값이 제대로나오는지 잘모르겠음.
