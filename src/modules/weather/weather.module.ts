import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { LoggingInterceptor } from '@/shared/interceptors/logging.interceptor';
import { WeatherController } from './weather.controller';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 3,
    }),
    CacheModule.register({
      isGlobal: true,
      ttl: 60 * 10,
      max: 100,
    }),
  ],
  controllers: [WeatherController],
  providers: [WeatherService, LoggingInterceptor],
  exports: [WeatherService],
})
export class WeatherModule {}
