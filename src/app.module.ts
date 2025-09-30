import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validationSchema } from './shared/config/env.validation';
import httpConfig from './shared/config/http.config';
import { AuthModule } from './modules/auth/auth.module';
import { PrismaModule } from './shared/prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
      load: [httpConfig],
      validate: (config) => {
        return validationSchema.parse(config);
      },
    }),
    AuthModule,
    PrismaModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
