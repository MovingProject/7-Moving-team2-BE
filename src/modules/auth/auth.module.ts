import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AUTH_SERVICE } from './interface/auth.service.interface';
import { AuthService } from './auth.service';
import { UserModule } from '@/modules/users/users.module';
import { HashingModule } from '@/shared/hashing/hashing.module';
import { JwtModule } from '@/shared/jwt/jwt.module';
import { TOKEN_REPOSITORY } from './interface/token.repository.interface';
import { PrismaTokenRepository } from '@/modules/auth/prisma-token.repository';

@Module({
  imports: [UserModule, HashingModule, JwtModule],
  controllers: [AuthController],
  providers: [
    {
      provide: AUTH_SERVICE,
      useClass: AuthService,
    },
    {
      provide: TOKEN_REPOSITORY,
      useClass: PrismaTokenRepository,
    },
  ],
  exports: [AUTH_SERVICE],
})
export class AuthModule {}
