'use client';

import { useState, useEffect, useCallback } from 'react';
import ToolLayout from '@/components/ToolLayout';

interface City {
  name: string;
  lat: number;
  lon: number;
}

const CITIES: City[] = [
  { name: '深圳', lat: 22.5431, lon: 114.0579 },
  { name: '北京', lat: 39.9042, lon: 116.4074 },
  { name: '上海', lat: 31.2304, lon: 121.4737 },
  { name: '广州', lat: 23.1291, lon: 113.2644 },
  { name: '香港', lat: 22.3193, lon: 114.1694 },
  { name: '东京', lat: 35.6762, lon: 139.6503 },
  { name: '纽约', lat: 40.7128, lon: -74.006 },
];

const WEATHER_MAP: Record<number, { desc: string; emoji: string }> = {
  0: { desc: '晴', emoji: '☀️' },
  1: { desc: '大部晴', emoji: '🌤' },
  2: { desc: '多云', emoji: '⛅' },
  3: { desc: '阴', emoji: '☁️' },
  45: { desc: '雾', emoji: '🌫' },
  48: { desc: '雾凇', emoji: '🌫' },
  51: { desc: '小毛毛雨', emoji: '🌦' },
  53: { desc: '中毛毛雨', emoji: '🌦' },
  55: { desc: '大毛毛雨', emoji: '🌧' },
  56: { desc: '冻毛毛雨', emoji: '🌧' },
  57: { desc: '强冻毛毛雨', emoji: '🌧' },
  61: { desc: '小雨', emoji: '🌦' },
  63: { desc: '中雨', emoji: '🌧' },
  65: { desc: '大雨', emoji: '🌧' },
  66: { desc: '冻雨', emoji: '🌧' },
  67: { desc: '强冻雨', emoji: '🌧' },
  71: { desc: '小雪', emoji: '🌨' },
  73: { desc: '中雪', emoji: '🌨' },
  75: { desc: '大雪', emoji: '❄️' },
  77: { desc: '雪粒', emoji: '❄️' },
  80: { desc: '小阵雨', emoji: '🌦' },
  81: { desc: '中阵雨', emoji: '🌧' },
  82: { desc: '强阵雨', emoji: '⛈' },
  85: { desc: '小阵雪', emoji: '🌨' },
  86: { desc: '强阵雪', emoji: '❄️' },
  95: { desc: '雷暴', emoji: '⛈' },
  96: { desc: '雷暴伴冰雹', emoji: '⛈' },
  99: { desc: '强雷暴伴冰雹', emoji: '⛈' },
};

function getWeatherInfo(code: number): { desc: string; emoji: string } {
  return WEATHER_MAP[code] || { desc: '未知', emoji: '❓' };
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return `${d.getMonth() + 1}/${d.getDate()} ${days[d.getDay()]}`;
}

interface DailyWeather {
  date: string;
  weatherCode: number;
  tempMax: number;
  tempMin: number;
  precipProb: number;
}

interface WeatherData {
  current: {
    temperature: number;
    apparentTemp: number;
    humidity: number;
    windSpeed: number;
    weatherCode: number;
  };
  daily: DailyWeather[];
}

export default function WeatherPage() {
  const [cityIndex, setCityIndex] = useState(0);
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const city = CITIES[cityIndex];

  const fetchWeather = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        latitude: city.lat.toString(),
        longitude: city.lon.toString(),
      });
      const res = await fetch(`/api/weather?${params}`);
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${res.status}`);
      }
      const json = await res.json();

      const dailyData: DailyWeather[] = json.daily.time.map((date: string, i: number) => ({
        date,
        weatherCode: json.daily.weather_code[i],
        tempMax: json.daily.temperature_2m_max[i],
        tempMin: json.daily.temperature_2m_min[i],
        precipProb: json.daily.precipitation_probability_max[i] ?? 0,
      }));

      setData({
        current: {
          temperature: json.current.temperature_2m,
          apparentTemp: json.current.apparent_temperature,
          humidity: json.current.relative_humidity_2m,
          windSpeed: json.current.wind_speed_10m,
          weatherCode: json.current.weather_code,
        },
        daily: dailyData,
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '未知错误';
      setError('获取天气失败：' + msg);
    } finally {
      setLoading(false);
    }
  }, [city.lat, city.lon]);

  useEffect(() => {
    fetchWeather();
  }, [fetchWeather]);

  const currentWeather = data ? getWeatherInfo(data.current.weatherCode) : null;

  return (
    <ToolLayout title="天气预报" description="多城市 7 天天气预报，显示温度、降水概率等详情">
      {/* City selector */}
      <div className="p-4 bg-dark-900 border border-dark-700 rounded-lg flex flex-wrap items-center gap-3">
        <span className="text-dark-400 text-sm shrink-0">选择城市：</span>
        <div className="flex flex-wrap gap-2">
          {CITIES.map((c, i) => (
            <button
              key={c.name}
              onClick={() => setCityIndex(i)}
              className={i === cityIndex ? 'tool-btn-primary !px-3 !py-1 text-sm' : 'tool-btn-secondary !px-3 !py-1 text-sm'}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-900/30 border border-red-700/50 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="p-12 bg-dark-900 border border-dark-700 rounded-xl text-dark-400 text-center">
          加载天气数据中…
        </div>
      ) : data ? (
        <>
          {/* Current weather card */}
          <div className="p-6 bg-dark-900 border border-dark-700 rounded-xl">
            <div className="flex flex-wrap items-center gap-6">
              <div className="text-6xl">{currentWeather?.emoji}</div>
              <div className="flex-1 min-w-[200px]">
                <div className="flex items-baseline gap-3 mb-1">
                  <span className="text-4xl font-bold text-white">{data.current.temperature}°C</span>
                  <span className="text-dark-400 text-lg">{currentWeather?.desc}</span>
                </div>
                <div className="text-dark-400 text-sm mb-3">{city.name} · 当前天气</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-dark-800 rounded-lg p-3 text-center">
                    <div className="text-dark-500 text-xs mb-1">体感温度</div>
                    <div className="text-white font-semibold">{data.current.apparentTemp}°C</div>
                  </div>
                  <div className="bg-dark-800 rounded-lg p-3 text-center">
                    <div className="text-dark-500 text-xs mb-1">湿度</div>
                    <div className="text-white font-semibold">{data.current.humidity}%</div>
                  </div>
                  <div className="bg-dark-800 rounded-lg p-3 text-center">
                    <div className="text-dark-500 text-xs mb-1">风速</div>
                    <div className="text-white font-semibold">{data.current.windSpeed} km/h</div>
                  </div>
                  <div className="bg-dark-800 rounded-lg p-3 text-center">
                    <div className="text-dark-500 text-xs mb-1">降水概率</div>
                    <div className="text-white font-semibold">{data.daily[0]?.precipProb ?? '-'}%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 7-day forecast */}
          <div className="p-6 bg-dark-900 border border-dark-700 rounded-xl space-y-3">
            <h2 className="text-white font-semibold mb-2">7 天预报</h2>
            <div className="space-y-2">
              {data.daily.map((day, i) => {
                const w = getWeatherInfo(day.weatherCode);
                const isToday = i === 0;
                return (
                  <div
                    key={day.date}
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      isToday ? 'bg-accent/10 border border-accent/20' : 'bg-dark-800'
                    }`}
                  >
                    <div className="w-[80px] sm:w-[100px] text-dark-300 text-sm shrink-0">
                      {isToday ? (
                        <span className="text-accent font-semibold">今天</span>
                      ) : (
                        formatDate(day.date)
                      )}
                    </div>
                    <div className="text-2xl w-8 text-center shrink-0">{w.emoji}</div>
                    <div className="flex-1 text-dark-300 text-sm">{w.desc}</div>
                    <div className="flex items-center gap-2 shrink-0">
                      {day.precipProb > 0 && (
                        <span className="text-blue-400 text-xs">💧{day.precipProb}%</span>
                      )}
                      <span className="text-blue-300 font-mono text-sm w-[40px] text-right">
                        {Math.round(day.tempMin)}°
                      </span>
                      <div className="w-16 sm:w-24 h-1.5 bg-dark-700 rounded-full overflow-hidden relative">
                        <div
                          className="absolute h-full rounded-full bg-gradient-to-r from-blue-400 to-orange-400"
                          style={{
                            left: `${Math.max(0, ((day.tempMin + 10) / 50) * 100)}%`,
                            right: `${Math.max(0, 100 - ((day.tempMax + 10) / 50) * 100)}%`,
                          }}
                        />
                      </div>
                      <span className="text-orange-300 font-mono text-sm w-[40px]">
                        {Math.round(day.tempMax)}°
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      ) : null}
    </ToolLayout>
  );
}
