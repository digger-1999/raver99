import NodeCache from 'node-cache';

export const cache = new NodeCache({ stdTTL: 60, checkperiod: 120 });

export function cacheFetch(key, fetcher, ttl) {
  const cached = cache.get(key);
  if (cached) {
    return Promise.resolve(cached);
  }

  return fetcher().then((result) => {
    cache.set(key, result, ttl);
    return result;
  });
}
