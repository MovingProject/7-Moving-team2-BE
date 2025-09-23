import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AUTH_SERVICE } from './interface/auth.service.interface';
import { AuthService } from './auth.service';
import { UserModule } from '@/modules/users/users.module';
import { HashingModule } from '@/shared/hashing/hashing.module';

@Module({
  imports: [UserModule, HashingModule],
  controllers: [AuthController],
  providers: [
    {
      provide: AUTH_SERVICE,
      useClass: AuthService,
    },
  ],
})
export class AuthModule {}
