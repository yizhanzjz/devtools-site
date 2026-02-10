import { NextRequest, NextResponse } from 'next/server';

const OPEN_METEO_BASE = 'https://api.open-meteo.com/v1/forecast';

// Mirror endpoints for reliability
const MIRRORS = [
  'https://api.open-meteo.com/v1/forecast',
  'https://archive-api.open-meteo.com/v1/forecast',
];

async function fetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const latitude = searchParams.get('latitude');
  const longitude = searchParams.get('longitude');

  if (!latitude || !longitude) {
    return NextResponse.json({ error: '缺少 latitude / longitude 参数' }, { status: 400 });
  }

  // Build query params for Open-Meteo
  const params = new URLSearchParams({
    latitude,
    longitude,
    current: 'temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
    timezone: 'auto',
    forecast_days: '7',
  });

  let lastError = '';

  // Try primary, then mirrors
  for (const base of MIRRORS) {
    const url = `${base}?${params}`;
    try {
      const res = await fetchWithTimeout(url, 8000);
      if (!res.ok) {
        lastError = `HTTP ${res.status} from ${base}`;
        continue;
      }
      const data = await res.json();

      return NextResponse.json(data, {
        headers: {
          'Cache-Control': 'public, max-age=300, s-maxage=300',
        },
      });
    } catch (e: unknown) {
      lastError = e instanceof Error ? e.message : String(e);
      // Try next mirror
      continue;
    }
  }

  // All mirrors failed — try wttr.in as ultimate fallback
  try {
    const wttrUrl = `https://wttr.in/?format=j1&lang=zh`;
    const res = await fetchWithTimeout(wttrUrl, 8000);
    if (res.ok) {
      const wttr = await res.json();
      // Convert wttr.in format to Open-Meteo-like format
      const current = wttr.current_condition?.[0];
      const forecasts = wttr.weather || [];

      const converted = {
        current: {
          temperature_2m: parseFloat(current?.temp_C || '0'),
          apparent_temperature: parseFloat(current?.FeelsLikeC || '0'),
          relative_humidity_2m: parseFloat(current?.humidity || '0'),
          wind_speed_10m: parseFloat(current?.windspeedKmph || '0'),
          weather_code: mapWttrCode(current?.weatherCode || ''),
        },
        daily: {
          time: forecasts.map((f: Record<string, string>) => f.date),
          weather_code: forecasts.map((f: Record<string, unknown[]>) => {
            const hourly = f.hourly as Record<string, string>[];
            return mapWttrCode(hourly?.[4]?.weatherCode || '');
          }),
          temperature_2m_max: forecasts.map((f: Record<string, string>) => parseFloat(f.maxtempC || '0')),
          temperature_2m_min: forecasts.map((f: Record<string, string>) => parseFloat(f.mintempC || '0')),
          precipitation_probability_max: forecasts.map(() => 0), // wttr doesn't have this easily
        },
        _source: 'wttr.in-fallback',
      };

      return NextResponse.json(converted, {
        headers: {
          'Cache-Control': 'public, max-age=600, s-maxage=600',
        },
      });
    }
  } catch {
    // wttr also failed
  }

  return NextResponse.json(
    { error: `天气数据获取失败: ${lastError}` },
    { status: 502 }
  );
}

// Map wttr.in weatherCode to WMO weather codes (Open-Meteo standard)
function mapWttrCode(code: string): number {
  const c = parseInt(code, 10);
  // wttr.in uses WWO codes, approximate mapping:
  const map: Record<number, number> = {
    113: 0,    // Clear/Sunny → Clear sky
    116: 2,    // Partly cloudy → Partly cloudy
    119: 3,    // Cloudy → Overcast
    122: 3,    // Overcast → Overcast
    143: 45,   // Mist → Fog
    176: 61,   // Patchy rain → Slight rain
    179: 71,   // Patchy snow → Slight snow
    182: 66,   // Patchy sleet → Freezing rain
    185: 56,   // Patchy freezing drizzle → Light freezing drizzle
    200: 95,   // Thundery outbreaks → Thunderstorm
    227: 73,   // Blowing snow → Moderate snow
    230: 75,   // Blizzard → Heavy snow
    248: 45,   // Fog
    260: 48,   // Freezing fog
    263: 51,   // Patchy light drizzle
    266: 53,   // Light drizzle
    281: 56,   // Freezing drizzle
    284: 57,   // Heavy freezing drizzle
    293: 61,   // Patchy light rain
    296: 61,   // Light rain
    299: 63,   // Moderate rain at times
    302: 63,   // Moderate rain
    305: 65,   // Heavy rain at times
    308: 65,   // Heavy rain
    311: 66,   // Light freezing rain
    314: 67,   // Moderate or heavy freezing rain
    317: 66,   // Light sleet
    320: 67,   // Moderate or heavy sleet
    323: 71,   // Patchy light snow
    326: 71,   // Light snow
    329: 73,   // Patchy moderate snow
    332: 73,   // Moderate snow
    335: 75,   // Patchy heavy snow
    338: 75,   // Heavy snow
    350: 77,   // Ice pellets
    353: 80,   // Light rain shower
    356: 81,   // Moderate or heavy rain shower
    359: 82,   // Torrential rain shower
    362: 85,   // Light sleet showers
    365: 86,   // Moderate or heavy sleet showers
    368: 85,   // Light snow showers
    371: 86,   // Moderate or heavy snow showers
    374: 96,   // Light showers of ice pellets
    377: 99,   // Moderate or heavy showers of ice pellets
    386: 95,   // Patchy light rain with thunder
    389: 99,   // Moderate or heavy rain with thunder
    392: 95,   // Patchy light snow with thunder
    395: 99,   // Moderate or heavy snow with thunder
  };
  return map[c] ?? 0;
}
