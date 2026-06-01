import { NextRequest, NextResponse } from 'next/server';

type IpApiResponse = {
  city?: string;
  country?: string;
  lat?: number;
  lon?: number;
  message?: string;
  query?: string;
  regionName?: string;
  status?: 'fail' | 'success';
  timezone?: string;
};

type OpenMeteoResponse = {
  current?: {
    apparent_temperature?: number;
    is_day?: number;
    relative_humidity_2m?: number;
    temperature_2m?: number;
    time?: string;
    weather_code?: number;
    wind_speed_10m?: number;
  };
  current_units?: Record<string, string>;
  timezone?: string;
};

const fallbackGeo: Required<Pick<IpApiResponse, 'city' | 'country' | 'lat' | 'lon' | 'query' | 'regionName' | 'timezone'>> = {
  city: '本地网络',
  country: 'Taiwan',
  lat: 25.033,
  lon: 121.5654,
  query: 'local',
  regionName: 'Taipei',
  timezone: 'Asia/Taipei',
};

function isPrivateIp(ip: string) {
  return (
    ip === '::1' ||
    ip === '127.0.0.1' ||
    ip.startsWith('10.') ||
    ip.startsWith('192.168.') ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(ip) ||
    ip.startsWith('fc') ||
    ip.startsWith('fd')
  );
}

function getClientIp(request: NextRequest) {
  const forwardedFor = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const candidates = [
    request.headers.get('cf-connecting-ip'),
    request.headers.get('x-real-ip'),
    forwardedFor,
  ].filter(Boolean) as string[];

  return candidates.find((ip) => !isPrivateIp(ip)) ?? '';
}

function buildIpApiUrl(ip: string) {
  const fields = 'status,message,country,regionName,city,lat,lon,timezone,query';
  const query = ip ? `/${encodeURIComponent(ip)}` : '';
  return `http://ip-api.com/json${query}?fields=${encodeURIComponent(fields)}&lang=zh-CN`;
}

export async function GET(request: NextRequest) {
  try {
    const clientIp = getClientIp(request);
    const geoResponse = await fetch(buildIpApiUrl(clientIp), {
      cache: 'no-store',
      headers: { accept: 'application/json' },
    });
    const geo = (await geoResponse.json()) as IpApiResponse;

    const isFallbackLocation = geo.status !== 'success' || typeof geo.lat !== 'number' || typeof geo.lon !== 'number';
    const resolvedGeo = isFallbackLocation
      ? fallbackGeo
      : {
          city: geo.city ?? '',
          country: geo.country ?? '',
          lat: geo.lat,
          lon: geo.lon,
          query: geo.query ?? clientIp,
          regionName: geo.regionName ?? '',
          timezone: geo.timezone ?? '',
        };

    const weatherUrl = new URL('https://api.open-meteo.com/v1/forecast');
    weatherUrl.searchParams.set('latitude', String(resolvedGeo.lat));
    weatherUrl.searchParams.set('longitude', String(resolvedGeo.lon));
    weatherUrl.searchParams.set(
      'current',
      'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m',
    );
    weatherUrl.searchParams.set('timezone', 'auto');
    weatherUrl.searchParams.set('forecast_days', '1');

    const weatherResponse = await fetch(weatherUrl, {
      cache: 'no-store',
      headers: { accept: 'application/json' },
    });
    const weather = (await weatherResponse.json()) as OpenMeteoResponse;

    if (!weather.current) {
      return NextResponse.json({ error: '天气读取失败', ok: false }, { status: 502 });
    }

    return NextResponse.json({
      ok: true,
      location: {
        city: resolvedGeo.city,
        country: resolvedGeo.country ?? '',
        ip: resolvedGeo.query ?? clientIp,
        isFallback: isFallbackLocation,
        latitude: resolvedGeo.lat,
        longitude: resolvedGeo.lon,
        region: resolvedGeo.regionName ?? '',
        timezone: weather.timezone ?? resolvedGeo.timezone ?? '',
      },
      weather: {
        apparentTemperature: weather.current.apparent_temperature ?? null,
        humidity: weather.current.relative_humidity_2m ?? null,
        isDay: weather.current.is_day === 1,
        temperature: weather.current.temperature_2m ?? null,
        time: weather.current.time ?? '',
        weatherCode: weather.current.weather_code ?? null,
        windSpeed: weather.current.wind_speed_10m ?? null,
      },
      units: weather.current_units ?? {},
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : '天气服务暂时不可用',
        ok: false,
      },
      { status: 500 },
    );
  }
}
