import axios from 'axios';
import { config } from '../config.js';
import { cacheFetch } from '../utils/cache.js';

export async function getRailDepartures({ stationCode = config.rail.stationCode, rows = 6 } = {}) {
  if (!config.rail.apiKey) {
    throw new Error('Missing National Rail access token');
  }

  const url = `${config.rail.serviceUrl}/departures/${stationCode}/${rows}`;
  const params = {
    accessToken: config.rail.apiKey,
    expand: 'serviceMessages'
  };

  return cacheFetch(`rail:${stationCode}`, async () => {
    const { data } = await axios.get(url, { params });
    const services = (data.trainServices || []).slice(0, rows).map((service) => ({
      destination: service.destination?.[0]?.locationName,
      scheduled: service.std,
      estimated: service.etd,
      platform: service.platform,
      operator: service.operator,
      status: service.isCancelled ? 'Cancelled' : service.etd,
      serviceId: service.serviceID,
      length: service.length
    }));

    return {
      station: data.locationName,
      services
    };
  }, 60);
}
