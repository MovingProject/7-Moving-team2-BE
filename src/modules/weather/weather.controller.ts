import { Controller, Get, Query } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { GetCurrentWeatherQueryDto, GetWeeklyForecastQueryDto } from './dto/weather.dto';

@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Get('current')
  async getCurrent(@Query() query: GetCurrentWeatherQueryDto) {
    return this.weatherService.getCurrentWeather(query.city);
  }

  @Get('forecast')
  async getForecast(@Query() query: GetWeeklyForecastQueryDto) {
    return this.weatherService.getWeeklyForecast(query.city, query.days);
  }
}
