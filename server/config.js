import 'dotenv/config';

const requiredEnv = [
  'OPENWEATHER_API_KEY',
  'NEWS_API_KEY',
  'NATIONAL_RAIL_APP_ID',
  'NATIONAL_RAIL_APP_KEY',
  'TFWM_APP_ID',
  'TFWM_APP_KEY'
];

export const config = {
  port: parseInt(process.env.PORT, 10) || 3000,
  weather: {
    apiKey: process.env.OPENWEATHER_API_KEY,
    defaultCity: process.env.DEFAULT_CITY || 'Birmingham,uk',
    units: process.env.WEATHER_UNITS || 'metric'
  },
  news: {
    apiKey: process.env.NEWS_API_KEY,
    source: process.env.NEWS_SOURCE || 'bbc-news',
    country: process.env.NEWS_COUNTRY || 'gb'
  },
  rail: {
    appId: process.env.NATIONAL_RAIL_APP_ID,
    apiKey: process.env.NATIONAL_RAIL_APP_KEY,
    stationCode: process.env.RAIL_STATION_CODE || 'BHM',
    serviceUrl: process.env.NATIONAL_RAIL_BASE_URL || 'https://huxley2.azurewebsites.net'
  },
  bus: {
    appId: process.env.TFWM_APP_ID,
    apiKey: process.env.TFWM_APP_KEY,
    stopCode: process.env.BUS_STOP_CODE || '43003836502',
    serviceUrl: process.env.TFWM_BASE_URL || 'https://transportapi.com/v3/uk/bus/stop'
  },
  calendar: {
    embedUrl: process.env.CALENDAR_EMBED_URL || ''
  }
};

export function validateConfig() {
  const missing = requiredEnv.filter((key) => !process.env[key]);
  if (missing.length) {
    console.warn(`Warning: missing environment variables: ${missing.join(', ')}`);
  }
}
