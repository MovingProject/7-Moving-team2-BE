import { UsersModule } from '@/modules/users/users.module';
import { HashingModule } from '@/shared/hashing/hashing.module';
import { JwtModule as SharedJwtModule } from '@/shared/jwt/jwt.module';
import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AccessTokenGuard } from './guards/accessToken.guard';
import { RefreshTokenGuard } from './guards/refreshToken.guard';

import { PrismaTokenRepository } from '@/modules/auth/infra/prisma-token.repository';
import { AUTH_SERVICE } from './interface/auth.service.interface';
import { TOKEN_REPOSITORY } from './interface/token.repository.interface';
import { CookieModule } from '@/shared/utils/cookie.module';
import { CookiesService } from '@/shared/utils/cookies.service';
@Module({
  imports: [UsersModule, HashingModule, SharedJwtModule, CookieModule],
  controllers: [AuthController],
  providers: [
    AccessTokenGuard,
    {
      provide: AUTH_SERVICE,
      useClass: AuthService,
    },
    {
      provide: TOKEN_REPOSITORY,
      useClass: PrismaTokenRepository,
    },
    RefreshTokenGuard,
    CookiesService,
  ],
  exports: [AUTH_SERVICE],
})
export class AuthModule {}
