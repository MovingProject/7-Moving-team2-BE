import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { AppModule } from './app.module';
import { HttpConfig } from './shared/config/http.config';
import { ConfigNotFoundException } from './shared/exceptions/config-not-found.exception';
import { CustomExceptionFilter } from './shared/middlewares/http-exception.filter';
import { SuccessInterceptor } from './shared/interceptors/success.interceptor';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'; // 👈 Swagger import
import { patchNestjsSwagger } from '@anatine/zod-nestjs'; // 👈 Zod를 위한 패치 import

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger:
      process.env.NODE_ENV === 'production' ? ['error', 'warn', 'log'] : ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  patchNestjsSwagger();

  const config = new DocumentBuilder()
    .setTitle('Moving API')
    .setDescription('이사 서비스 매칭 플랫폼 API 문서입니다.')
    .setVersion('1.0')
    .addTag('API')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document); //'/api-docs' 경로에 문서 생성

  const configService = app.get(ConfigService);
  const httpConfig = configService.get<HttpConfig>('http');

  if (!httpConfig) {
    throw new ConfigNotFoundException('HTTP configuration is missing. Check your config files.');
  }

  app.enableCors({
    origin: httpConfig.corsOrigins,
    credentials: true,
  });

  app.use(cookieParser());
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

  app.useGlobalInterceptors(new SuccessInterceptor());
  app.useGlobalFilters(new CustomExceptionFilter());

  await app.listen(httpConfig.port);
}

bootstrap().catch((error) => {
  console.error('NestJS application failed to start:', error);
  process.exit(1);
});
