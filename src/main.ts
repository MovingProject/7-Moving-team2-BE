import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { ConfigService } from '@nestjs/config';
import { HttpConfig } from './shared/config/http.config';
import { ConfigNotFoundException } from './shared/exceptions/config-not-found.exception';
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger:
      process.env.NODE_ENV === 'production' ? ['error', 'warn', 'log'] : ['error', 'warn', 'log', 'debug', 'verbose'],
  });

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

  await app.listen(httpConfig.port);
}
bootstrap();
