import axios from 'axios';
import { config } from '../config.js';
import { cacheFetch } from '../utils/cache.js';

const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

export async function getWeather(city = config.weather.defaultCity) {
  if (!config.weather.apiKey) {
    throw new Error('Missing OpenWeather API key');
  }

  const params = {
    q: city,
    appid: config.weather.apiKey,
    units: config.weather.units
  };

  return cacheFetch(`weather:${city}`, async () => {
    const { data } = await axios.get(BASE_URL, { params });
    return {
      temperature: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
      description: data.weather?.[0]?.description ?? 'Unknown',
      icon: data.weather?.[0]?.icon ?? '01d',
      sunrise: data.sys?.sunrise,
      sunset: data.sys?.sunset,
      city: data.name,
      country: data.sys?.country
    };
  }, 300);
}
