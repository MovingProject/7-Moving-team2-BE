import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule as NestJwtModule } from '@nestjs/jwt';
import { JWT_SERVICE } from './jwt.service.interface';
import { NestjsJwtService } from '@/shared/jwt/nestjs-jwt.service';

@Global()
@Module({
  imports: [
    NestJwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const issuer = configService.get<string>('JWT_ISSUER')!;
        return {
          secret: configService.get<string>('JWT_ACCESS_SECRET')!,
          signOptions: {
            expiresIn: configService.get<string>('JWT_ACCESS_EXPIRES_IN')!,
            issuer: issuer,
          },
          verifyOptions: {
            issuer: issuer,
            algorithms: ['HS256'],
            clockTolerance: 5,
          },
        };
      },
    }),
  ],
  providers: [
    {
      provide: JWT_SERVICE,
      useClass: NestjsJwtService,
    },
  ],
  exports: [JWT_SERVICE],
})
export class JwtModule {}
