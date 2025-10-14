import axios from 'axios';
import { config } from '../config.js';
import { cacheFetch } from '../utils/cache.js';

const BASE_URL = process.env.NEWS_BASE_URL || 'https://newsdata.io/api/1/news';

export async function getNews({ query = '', country = config.news.country } = {}) {
  if (!config.news.apiKey) {
    throw new Error('Missing News API key');
  }

  const params = {
    apikey: config.news.apiKey,
    country,
    language: 'en',
    q: query || undefined,
    category: process.env.NEWS_CATEGORY || undefined
  };

  return cacheFetch(`news:${country}:${query}`, async () => {
    const { data } = await axios.get(BASE_URL, { params });
    const articles = (data.results || []).slice(0, 6).map((article) => ({
      title: article.title,
      url: article.link,
      source: article.source_id,
      publishedAt: article.pubDate,
      imageUrl: article.image_url
    }));

    return { articles };
  }, 600);
}
