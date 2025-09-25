import { Module } from '@nestjs/common';
import { USER_REPOSITORY } from './interface/users.repository.interface';
import { PrismaUserRepository } from '@/modules/users/prisma-user.repository';
import { PrismaModule } from '@/shared/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: USER_REPOSITORY,
      useClass: PrismaUserRepository,
    },
  ],
  exports: [USER_REPOSITORY],
})
export class UserModule {}
