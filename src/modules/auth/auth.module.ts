import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthGuard } from './guards/auth.guard';
import { UserModule } from '@/modules/users/users.module';
import { HashingModule } from '@/shared/hashing/hashing.module';
import { JwtModule as SharedJwtModule } from '@/shared/jwt/jwt.module';

import { AUTH_SERVICE } from './interface/auth.service.interface';
import { TOKEN_REPOSITORY } from './interface/token.repository.interface';
import { PrismaTokenRepository } from '@/modules/auth/infra/prisma-token.repository';

@Module({
  imports: [
    UserModule,
    HashingModule,
    SharedJwtModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_ACCESS_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_ACCESS_EXPIRES_IN'),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthGuard,
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
