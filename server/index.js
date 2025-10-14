import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import { config, validateConfig } from './config.js';
import { getWeather } from './services/weatherService.js';
import { getNews } from './services/newsService.js';
import { getBusDepartures } from './services/busService.js';
import { getRailDepartures } from './services/railService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

validateConfig();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/config', (_, res) => {
  res.json({
    calendarEmbedUrl: config.calendar.embedUrl,
    defaultCity: config.weather.defaultCity,
    railStation: config.rail.stationCode,
    busStop: config.bus.stopCode
  });
});

app.get('/api/weather', async (req, res) => {
  try {
    const city = req.query.city;
    const weather = await getWeather(city);
    res.json(weather);
  } catch (error) {
    console.error('Weather fetch error', error.message);
    res.status(500).json({ error: 'Failed to fetch weather' });
  }
});

app.get('/api/news', async (req, res) => {
  try {
    const { q, country } = req.query;
    const news = await getNews({ query: q, country });
    res.json(news);
  } catch (error) {
    console.error('News fetch error', error.message);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

app.get('/api/bus', async (req, res) => {
  try {
    const { stopCode } = req.query;
    const buses = await getBusDepartures({ stopCode });
    res.json(buses);
  } catch (error) {
    console.error('Bus fetch error', error.message);
    res.status(500).json({ error: 'Failed to fetch bus departures' });
  }
});

app.get('/api/rail', async (req, res) => {
  try {
    const { stationCode, rows } = req.query;
    const trains = await getRailDepartures({ stationCode, rows });
    res.json(trains);
  } catch (error) {
    console.error('Rail fetch error', error.message);
    res.status(500).json({ error: 'Failed to fetch rail departures' });
  }
});

app.use(express.static(path.join(__dirname, '../public')));

app.get('*', (_, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(config.port, () => {
  console.log(`Dashboard server running on port ${config.port}`);
});
