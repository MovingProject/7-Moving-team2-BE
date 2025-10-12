// src/modules/users/users.module.ts
import { Module } from '@nestjs/common';
import { PrismaModule } from '@/shared/prisma/prisma.module';

// controllers
import { UsersController } from './users.controller';
import { DriverController } from './driver.controller';

// services
import { UsersService } from './users.service';
import DriverService from './driver.service';

// DI tokens (interfaces)
import { USER_REPOSITORY } from './interface/users.repository.interface';
import { DRIVER_PROFILE_REPOSITORY } from './interface/driverProfile.interface';
import { LIKE_REPOSITORY } from './interface/like.repository.interface';
import { DRIVER_SERVICE } from './interface/driver.service.interface';

// infra implementations
import { PrismaUserRepository } from './infra/prisma-user.repository';
import { PrismaDriverProfileRepository } from './infra/prisma-driverProfile.repository';
import { PrismaLikeRepository } from './infra/prisma-like.repository';
import { CookiesService } from '@/shared/utils/cookies.service';
import { HashingModule } from '@/shared/hashing/hashing.module';

@Module({
  imports: [PrismaModule, HashingModule],
  controllers: [UsersController, DriverController],
  providers: [
    UsersService,
    { provide: USER_REPOSITORY, useClass: PrismaUserRepository },
    { provide: DRIVER_PROFILE_REPOSITORY, useClass: PrismaDriverProfileRepository },
    { provide: LIKE_REPOSITORY, useClass: PrismaLikeRepository },
    { provide: DRIVER_SERVICE, useClass: DriverService },
    CookiesService,
  ],
  exports: [UsersService, USER_REPOSITORY, DRIVER_SERVICE],
})
export class UsersModule {}
