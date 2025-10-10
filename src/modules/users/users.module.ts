import { Module } from '@nestjs/common';
import { USER_REPOSITORY } from './interface/users.repository.interface';
import { PrismaUserRepository } from '@/modules/users/prisma-user.repository';
import { PrismaModule } from '@/shared/prisma/prisma.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CookiesService } from '@/shared/utils/cookies.service';
import { HashingModule } from '@/shared/hashing/hashing.module';

@Module({
  imports: [PrismaModule, HashingModule],
  controllers: [UsersController],
  providers: [
    UsersService,
    {
      provide: USER_REPOSITORY,
      useClass: PrismaUserRepository,
    },
    CookiesService,
  ],
  exports: [UsersService, USER_REPOSITORY],
})
export class UserModule {}
