'use client';

import {
  AlertCircle,
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Clock3,
  Droplets,
  LocateFixed,
  MapPin,
  RefreshCw,
  Sun,
  Thermometer,
  Wind,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

type WeatherResponse = {
  error?: string;
  location?: {
    city: string;
    country: string;
    ip: string;
    latitude: number;
    longitude: number;
    region: string;
    timezone: string;
  };
  ok: boolean;
  units?: Record<string, string>;
  weather?: {
    apparentTemperature: number | null;
    humidity: number | null;
    isDay: boolean;
    temperature: number | null;
    time: string;
    weatherCode: number | null;
    windSpeed: number | null;
  };
};

function getWeatherMeta(code: number | null | undefined, isDay = true) {
  if (code === 0) return { icon: isDay ? Sun : CloudSun, label: isDay ? '晴朗' : '晴夜' };
  if ([1, 2, 3].includes(code ?? -1)) return { icon: CloudSun, label: '多云' };
  if ([45, 48].includes(code ?? -1)) return { icon: CloudFog, label: '有雾' };
  if ([51, 53, 55, 56, 57].includes(code ?? -1)) return { icon: CloudDrizzle, label: '毛毛雨' };
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code ?? -1)) return { icon: CloudRain, label: '降雨' };
  if ([71, 73, 75, 77, 85, 86].includes(code ?? -1)) return { icon: CloudSnow, label: '降雪' };
  if ([95, 96, 99].includes(code ?? -1)) return { icon: CloudLightning, label: '雷阵雨' };
  return { icon: Cloud, label: '天气' };
}

function formatTemperature(value: number | null | undefined) {
  return typeof value === 'number' ? `${Math.round(value)}°` : '--°';
}

function formatMetric(value: number | null | undefined, unit: string, fallback = '--') {
  return typeof value === 'number' ? `${Math.round(value)}${unit}` : fallback;
}

function formatPlace(location: WeatherResponse['location']) {
  if (!location) return '正在定位';
  return [location.city, location.region, location.country].filter(Boolean).join(' · ') || '未知位置';
}

export function WeatherCard() {
  const [weather, setWeather] = useState<WeatherResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [now, setNow] = useState('');

  const timezone = weather?.location?.timezone;
  const meta = getWeatherMeta(weather?.weather?.weatherCode, weather?.weather?.isDay);
  const WeatherIcon = meta.icon;

  useEffect(() => {
    let disposed = false;

    async function loadWeather() {
      setIsLoading(true);
      setError('');
      try {
        const response = await fetch('/api/weather', { cache: 'no-store' });
        const data = (await response.json()) as WeatherResponse;
        if (disposed) return;

        if (!response.ok || !data.ok) {
          setError(data.error ?? '天气读取失败');
          setWeather(data);
        } else {
          setWeather(data);
        }
      } catch {
        if (!disposed) setError('天气服务暂时不可用');
      } finally {
        if (!disposed) setIsLoading(false);
      }
    }

    loadWeather();
    const timer = window.setInterval(loadWeather, 10 * 60 * 1000);

    return () => {
      disposed = true;
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    function tick() {
      const formatter = new Intl.DateTimeFormat('zh-CN', {
        hour: '2-digit',
        hour12: false,
        minute: '2-digit',
        second: '2-digit',
        timeZone: timezone || undefined,
      });
      setNow(formatter.format(new Date()));
    }

    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [timezone]);

  const statusText = useMemo(() => {
    if (isLoading) return '正在读取位置与天气';
    if (error) return error;
    return meta.label;
  }, [error, isLoading, meta.label]);

  return (
    <section className="glass-panel flex min-h-44 flex-col justify-between overflow-hidden p-6 transition hover:-translate-y-1 hover:border-sky-300/35 md:p-7">
      <div className="flex items-start justify-between gap-5">
        <div>
          <div className="adaptive-subtle inline-flex items-center gap-2 rounded-full border border-white/14 bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em]">
            <LocateFixed size={13} />
            Weather
          </div>
          <div className="adaptive-text mt-4 flex items-baseline gap-3">
            <span className="text-5xl font-black leading-none">{formatTemperature(weather?.weather?.temperature)}</span>
            <span className="text-sm font-black">{statusText}</span>
          </div>
        </div>
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-sky-400/24 text-sky-100 shadow-[0_0_34px_rgba(56,189,248,0.36)]">
          {isLoading ? <RefreshCw className="animate-spin" size={28} /> : error ? <AlertCircle size={28} /> : <WeatherIcon size={30} />}
        </div>
      </div>

      <div className="mt-6 grid gap-3 text-xs font-bold sm:grid-cols-2 lg:grid-cols-4">
        <div className="adaptive-muted flex items-center gap-2">
          <Clock3 size={15} />
          <span className="font-mono text-base">{now}</span>
        </div>
        <div className="adaptive-muted flex items-center gap-2">
          <MapPin size={15} />
          <span className="truncate">{formatPlace(weather?.location)}</span>
        </div>
        <div className="adaptive-muted flex items-center gap-2">
          <Thermometer size={15} />
          <span>体感 {formatTemperature(weather?.weather?.apparentTemperature)}</span>
        </div>
        <div className="adaptive-muted flex items-center gap-2">
          <Wind size={15} />
          <span>{formatMetric(weather?.weather?.windSpeed, ' km/h')}</span>
          <Droplets className="ml-1" size={15} />
          <span>{formatMetric(weather?.weather?.humidity, '%')}</span>
        </div>
      </div>
    </section>
  );
}
