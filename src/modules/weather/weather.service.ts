import { HttpService } from '@nestjs/axios';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { firstValueFrom, retry, catchError } from 'rxjs';
import { WeatherCurrentResponse, WeatherForecastResponse } from './type/weather.types';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class WeatherService {
  private readonly logger = new Logger(WeatherService.name);
  private readonly baseUrl = 'https://api.weatherapi.com/v1';
  private readonly defaultParams = {
    key: process.env.WEATHER_API_KEY,
    lang: 'ko',
  };

  constructor(
    private readonly httpService: HttpService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  private async fetchWeather<T>(
    endpoint: string,
    extraParams: Record<string, string | number | boolean | undefined>,
  ): Promise<T> {
    const cacheKey = `weather:${endpoint}:${JSON.stringify(extraParams)}`;
    const cached = await this.cacheManager.get<T>(cacheKey);
    if (cached) {
      this.logger.debug(`캐시에서 불러옴: ${cacheKey}`);
      return cached;
    }

    this.logger.debug(`API로부터 새 데이터 요청: ${endpoint}`);

    try {
      const { data } = await firstValueFrom(
        this.httpService
          .get(`${this.baseUrl}/${endpoint}`, {
            params: { ...this.defaultParams, ...extraParams },
          })
          .pipe(
            retry({ count: 2, delay: 1000 }),
            catchError((err) => {
              this.logger.error(`WeatherAPI Error: ${err.message}`);
              throw err;
            }),
          ),
      );

      await this.cacheManager.set(cacheKey, data, 60 * 10);
      return data;
    } catch (error) {
      this.logger.error(`🌩 WeatherAPI Error: ${error.message}`);
      throw error;
    }
  }

  async getCurrentWeather(city: string) {
    const data = await this.fetchWeather<WeatherCurrentResponse>('current.json', { q: city });
    return {
      location: data.location.name,
      country: data.location.country,
      temp: data.current.temp_c,
      condition: data.current.condition.text,
      icon: data.current.condition.icon,
      humidity: data.current.humidity,
      wind_kph: data.current.wind_kph,
      feelslike_c: data.current.feelslike_c,
      last_updated: data.current.last_updated,
    };
  }

  async getWeeklyForecast(city: string, days = 7) {
    const data = await this.fetchWeather<WeatherForecastResponse>('forecast.json', { q: city, days });
    return {
      location: data.location.name,
      country: data.location.country,
      forecastDays: data.forecast.forecastday.map((day) => ({
        date: day.date,
        maxtemp_c: day.day.maxtemp_c,
        mintemp_c: day.day.mintemp_c,
        avgtemp_c: day.day.avgtemp_c,
        condition: day.day.condition.text,
        icon: day.day.condition.icon,
        daily_chance_of_rain: day.day.daily_chance_of_rain,
      })),
    };
  }
}
