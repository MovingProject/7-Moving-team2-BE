import { Controller, Get, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserDtoFactory } from './dto/user.response.dto';
import { NotFoundException } from '@nestjs/common';
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
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
