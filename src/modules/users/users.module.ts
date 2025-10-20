// src/modules/users/users.module.ts
import { Module } from '@nestjs/common';
import { PrismaModule } from '@/shared/prisma/prisma.module';

// controllers
import { UsersController } from './users.controller';
import { DriverController } from './driver.controller';
import { ConsumerController } from './consumer.controller';

// services
import { UsersService } from './users.service';
import DriverService from './driver.service';
import { ConsumerService } from './consumer.service';
// DI tokens (interfaces)
import { USER_REPOSITORY } from './interface/users.repository.interface';
import { DRIVER_PROFILE_REPOSITORY } from './interface/driverProfile.repository.interface';
import { LIKE_REPOSITORY } from './interface/like.repository.interface';
import { DRIVER_SERVICE } from './interface/driver.service.interface';
import { CONSUMER_SERVICE } from './interface/consumer.service.interface';
import { CONSUMER_PROFILE_REPOSITORY } from './interface/consumerProfile.repository.interface';
import { INVITE_REPOSITORY } from '../requests/interface/invite.repository.interface';
// infra implementations
import { PrismaUserRepository } from './infra/prisma-user.repository';
import { PrismaDriverProfileRepository } from './infra/prisma-driverProfile.repository';
import { PrismaLikeRepository } from './infra/prisma-like.repository';
import { CookiesService } from '@/shared/utils/cookies.service';
import { HashingModule } from '@/shared/hashing/hashing.module';
import { PrismaConsumerProfileRepository } from './infra/prisma-consumerProfile.repository';
import { PrismaInviteRepository } from '../requests/infra/prisma-invite.repository';
@Module({
  imports: [PrismaModule, HashingModule],
  controllers: [UsersController, DriverController, ConsumerController],
  providers: [
    UsersService,
    { provide: USER_REPOSITORY, useClass: PrismaUserRepository },
    { provide: DRIVER_PROFILE_REPOSITORY, useClass: PrismaDriverProfileRepository },
    { provide: LIKE_REPOSITORY, useClass: PrismaLikeRepository },
    { provide: DRIVER_SERVICE, useClass: DriverService },
    { provide: CONSUMER_SERVICE, useClass: ConsumerService },
    { provide: CONSUMER_PROFILE_REPOSITORY, useClass: PrismaConsumerProfileRepository },
    { provide: INVITE_REPOSITORY, useClass: PrismaInviteRepository },
    CookiesService,
  ],
  exports: [UsersService, USER_REPOSITORY, DRIVER_SERVICE],
})
export class UsersModule {}
