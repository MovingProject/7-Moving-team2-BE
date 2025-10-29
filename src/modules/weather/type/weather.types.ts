export interface WeatherCurrentResponse {
  location: {
    name: string;
    country: string;
  };
  current: {
    temp_c: number;
    feelslike_c: number;
    humidity: number;
    wind_kph: number;
    last_updated: string;
    condition: {
      text: string;
      icon: string;
    };
  };
}

export interface WeatherForecastResponse {
  location: {
    name: string;
    country: string;
  };
  forecast: {
    forecastday: {
      date: string;
      day: {
        maxtemp_c: number;
        mintemp_c: number;
        avgtemp_c: number;
        daily_chance_of_rain: number;
        condition: {
          text: string;
          icon: string;
        };
      };
    }[];
  };
}
