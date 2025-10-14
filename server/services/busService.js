import axios from 'axios';
import { config } from '../config.js';
import { cacheFetch } from '../utils/cache.js';

export async function getBusDepartures({ stopCode = config.bus.stopCode, direction = 'live' } = {}) {
  if (!config.bus.appId || !config.bus.apiKey) {
    throw new Error('Missing TransportAPI credentials');
  }

  const url = `${config.bus.serviceUrl}/${stopCode}/${direction}.json`;
  const params = {
    app_id: config.bus.appId,
    app_key: config.bus.apiKey,
    group: 'route',
    nextbuses: 'no'
  };

  return cacheFetch(`bus:${stopCode}`, async () => {
    const { data } = await axios.get(url, { params });
    const departures = Object.values(data.departures || {}).flat().slice(0, 6).map((departure) => ({
      line: departure.line,
      direction: departure.direction,
      expectedDepartureTime: departure.expected_departure_time,
      aimedDepartureTime: departure.aimed_departure_time,
      operator: departure.operator,
      status: departure.status
    }));

    return {
      stopName: data.stop_name,
      locality: data.locality,
      departures
    };
  }, 60);
}
