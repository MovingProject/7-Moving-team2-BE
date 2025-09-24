import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { CreateConsumerProfileDto } from './dto/createConsumerProfile.dto';
import { CreateDriverProfileDto } from './dto/createDriverProfile.dto';

@Controller('profiles')
export class ProfileController {
  constructor(private readonly service: ProfileService) {}

  @Post('consumer')
  @HttpCode(HttpStatus.CREATED)
  createConsumer(@Body() dto: CreateConsumerProfileDto) {
    return this.service.createConsumerProfile(dto);
  }

  @Post('driver')
  @HttpCode(HttpStatus.CREATED)
  createDriver(@Body() dto: CreateDriverProfileDto) {
    return this.service.createDriverProfile(dto);
  }
}
