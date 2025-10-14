let dotenvModule;
try {
  dotenvModule = await import('dotenv');
} catch (error) {
  console.error('❌ Unable to load the "dotenv" package.');
  console.error('Run `npm install` before checking your configuration.');
  process.exit(1);
}

const { config } = dotenvModule;
config();

const requiredVariables = [
  'OPENWEATHER_API_KEY',
  'NEWS_API_KEY',
  'NATIONAL_RAIL_APP_KEY',
  'TFWM_APP_ID',
  'TFWM_APP_KEY',
  'DEFAULT_CITY',
  'RAIL_STATION_CODE',
  'BUS_STOP_CODE'
];

const optionalVariables = [
  'NATIONAL_RAIL_APP_ID',
  'CALENDAR_EMBED_URL',
  'PORT',
  'NEWS_COUNTRY',
  'NEWS_CATEGORY',
  'WEATHER_UNITS'
];

const missing = requiredVariables.filter((name) => {
  const value = process.env[name];
  return value === undefined || value === '';
});

if (missing.length > 0) {
  console.error('❌ Missing required environment variables:');
  missing.forEach((name) => console.error(`- ${name}`));
  console.error('\nCreate or update your .env file before starting the server.');
  process.exit(1);
}

console.log('✅ All required environment variables are present.');

const unsetOptional = optionalVariables.filter((name) => {
  const value = process.env[name];
  return value === undefined || value === '';
});

if (unsetOptional.length > 0) {
  console.log('\nℹ️  Optional variables you may want to set:');
  unsetOptional.forEach((name) => console.log(`- ${name}`));
}

console.log('\nYou can now run `npm start` to launch the dashboard.');
