# Home Hub Dashboard

A lightweight family dashboard optimised for older tablets. It shows local weather, news headlines, bus departures, train departures, and an embedded family calendar. Data is proxied through a small Node.js server so you can keep API keys private while exposing a simple front-end.

## Features

- Weather widget via OpenWeather
- Local news headlines via Newsdata (configurable)
- TransportAPI bus departures
- National Rail departures via the Huxley2 proxy
- Optional embedded calendar (Google/Outlook or any embeddable URL)
- Auto-refreshing front-end optimised for kiosk/iPad display

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Create a `.env` file at the project root:

```bash
OPENWEATHER_API_KEY=your_openweather_key
NEWS_API_KEY=your_news_api_key
NATIONAL_RAIL_APP_ID=unused-but-required
NATIONAL_RAIL_APP_KEY=your_huxley_token
TFWM_APP_ID=your_transportapi_app_id
TFWM_APP_KEY=your_transportapi_key
DEFAULT_CITY=Birmingham,uk
RAIL_STATION_CODE=BHM
BUS_STOP_CODE=43003836502
CALENDAR_EMBED_URL=https://calendar.google.com/calendar/embed?src=...
```

> The National Rail Huxley2 proxy only needs an access token. Use `NATIONAL_RAIL_APP_KEY` for that value – `NATIONAL_RAIL_APP_ID` is included for compatibility with other wrappers.

You can also override: `PORT`, `NEWS_COUNTRY`, `NEWS_CATEGORY`, `WEATHER_UNITS`, `NEWS_BASE_URL`, and `TFWM_BASE_URL` if required.

### 3. Verify your configuration

Before starting the server, run the helper script to ensure all required environment variables are present:

```bash
npm run check-env
```

If anything is missing the script will list the variables to add to your `.env` file.

### 4. Run the server

```bash
npm start
```

The dashboard will be available at `http://localhost:3000`. Pin it to full-screen mode on your tablet for the best experience.

## Customising the Front-End

The dashboard lives inside `public/`. Update `styles.css` for theming, and tweak `app.js` if you want to display additional information from the APIs. The front-end polls the server every 60 seconds; adjust `setInterval` calls if you need faster or slower refreshes.

## Extending

- Add caching durations in `server/utils/cache.js`
- Create extra widgets by adding new routes and services
- Consider running behind a reverse proxy (e.g. nginx) and enabling basic auth if exposing outside your LAN

## License

MIT
