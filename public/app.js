const weatherEl = document.getElementById('weather');
const newsEl = document.getElementById('news');
const busEl = document.getElementById('bus');
const railEl = document.getElementById('rail');
const lastUpdatedEl = document.getElementById('last-updated');
const clockEl = document.getElementById('clock');
const calendarFrame = document.getElementById('calendar-frame');
const calendarPlaceholder = document.getElementById('calendar-placeholder');
let dashboardConfig = {};
let configLoaded = false;

const formatter = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  minute: '2-digit'
});

function updateClock() {
  const now = new Date();
  clockEl.textContent = `${now.toLocaleDateString('en-GB', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  })} — ${formatter.format(now)}`;
}

async function fetchJSON(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}`);
  }
  return response.json();
}

function renderWeather(data) {
  weatherEl.innerHTML = `
    <div class="weather__temperature">${data.temperature}°</div>
    <div>${data.description} in ${data.city}</div>
    <div class="weather__details">
      <span><strong>Feels like</strong> ${data.feelsLike}°</span>
      <span><strong>Wind</strong> ${Math.round(data.windSpeed)} m/s</span>
      <span><strong>Humidity</strong> ${data.humidity}%</span>
    </div>
  `;
}

function renderRail(data) {
  if (!data.services?.length) {
    railEl.textContent = 'No departures found';
    return;
  }

  const list = document.createElement('ul');
  list.className = 'list';
  data.services.forEach((service) => {
    const item = document.createElement('li');
    item.className = 'list__item';
    item.innerHTML = `
      <div>
        <strong>${service.destination}</strong>
        <div class="list__meta">Plat ${service.platform ?? '-'} • ${service.operator}</div>
      </div>
      <div>
        <div>${service.scheduled}</div>
        <div class="list__meta">${service.estimated}</div>
      </div>
    `;
    list.appendChild(item);
  });

  railEl.innerHTML = '';
  railEl.appendChild(list);
}

function renderBus(data) {
  if (!data.departures?.length) {
    busEl.textContent = 'No buses due soon';
    return;
  }

  const list = document.createElement('ul');
  list.className = 'list';
  data.departures.forEach((departure) => {
    const item = document.createElement('li');
    item.className = 'list__item';
    item.innerHTML = `
      <div>
        <strong>${departure.line}</strong>
        <div class="list__meta">${departure.direction}</div>
      </div>
      <div>
        <div>${departure.expectedDepartureTime}</div>
        <div class="list__meta">due ${departure.status}</div>
      </div>
    `;
    list.appendChild(item);
  });

  busEl.innerHTML = '';
  busEl.appendChild(list);
}

function renderNews(data) {
  if (!data.articles?.length) {
    newsEl.textContent = 'No headlines at the moment';
    return;
  }

  const fragment = document.createDocumentFragment();
  data.articles.forEach((article) => {
    const link = document.createElement('a');
    link.href = article.url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = article.title;
    link.className = 'news__headline';

    const meta = document.createElement('div');
    meta.className = 'list__meta';
    const published = article.publishedAt
      ? new Date(article.publishedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
      : '';
    meta.textContent = `${article.source ?? ''} ${published ? `• ${published}` : ''}`.trim();

    const container = document.createElement('div');
    container.appendChild(link);
    container.appendChild(meta);
    fragment.appendChild(container);
  });

  newsEl.innerHTML = '';
  newsEl.appendChild(fragment);
}

async function loadDashboard() {
  try {
    const [config, weather, news, bus, rail] = await Promise.all([
      configLoaded ? Promise.resolve(dashboardConfig) : fetchJSON('/api/config'),
      fetchJSON('/api/weather'),
      fetchJSON('/api/news'),
      fetchJSON('/api/bus'),
      fetchJSON('/api/rail')
    ]);

    dashboardConfig = config;
    configLoaded = true;
    initCalendar();
    renderWeather(weather);
    renderNews(news);
    renderBus(bus);
    renderRail(rail);
    lastUpdatedEl.textContent = `Last updated ${new Date().toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit'
    })}`;
  } catch (error) {
    console.error(error);
    lastUpdatedEl.textContent = 'Some data failed to load.';
  }
}

function initCalendar() {
  const embedUrl = dashboardConfig.calendarEmbedUrl || '';
  if (!calendarFrame) return;

  if (embedUrl) {
    if (calendarFrame.src !== embedUrl) {
      calendarFrame.src = embedUrl;
    }
    calendarFrame.style.display = 'block';
    if (calendarPlaceholder) {
      calendarPlaceholder.style.display = 'none';
    }
  } else {
    calendarFrame.style.display = 'none';
    if (calendarPlaceholder) {
      calendarPlaceholder.style.display = 'block';
    }
  }
}

updateClock();
setInterval(updateClock, 60 * 1000);

loadDashboard();
setInterval(loadDashboard, 60 * 1000);
