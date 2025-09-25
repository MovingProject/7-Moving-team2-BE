import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule as NestJwtModule } from '@nestjs/jwt';
import { JWT_SERVICE } from './jwt.service.interface';
import { NestjsJwtService } from '@/infra/jwt/nestjs-jwt.service';

@Global()
@Module({
  imports: [
    NestJwtModule.registerAsync({
      inject: [ConfigService], // ConfigService를 주입받아 사용
      useFactory: (_configService: ConfigService) => ({}),
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
