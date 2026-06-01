'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSiteSettings } from '@/components/settings/SettingsProvider';
import { withCacheBust } from '@/lib/site-settings';

const danmakuTexts = [
  '今天整理文档了吗？',
  '把灵感先保存下来',
  'YouTube Music 推荐中',
  '写一点，再写一点',
  '项目进度同步到 GitHub',
  '背景图正在轮换',
  '给未来的自己留一盏灯',
  'Markdown 工作台在线',
];

type Firefly = {
  delay: string;
  duration: string;
  id: number;
  left: string;
  pulseDuration: string;
  size: string;
  top: string;
};

type BackgroundSample = {
  hue: number;
  luminance: number;
};

type AdaptiveTheme = {
  accent: string;
  accentGlow: string;
  border: string;
  muted: string;
  shadow: string;
  softShadow: string;
  subtle: string;
  text: string;
  tone: 'dark' | 'light';
};

function seededRatio(seed: number) {
  return Math.abs(Math.sin(seed * 12.9898) * 43758.5453) % 1;
}

function round(value: number, precision = 2) {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
}

function getRelativeLuminance(r: number, g: number, b: number) {
  const [red, green, blue] = [r, g, b].map((value) => {
    const channel = value / 255;
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function getHue(r: number, g: number, b: number) {
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;

  if (delta === 0) return 210;
  if (max === red) return Math.round(60 * (((green - blue) / delta) % 6));
  if (max === green) return Math.round(60 * ((blue - red) / delta + 2));
  return Math.round(60 * ((red - green) / delta + 4));
}

function buildAdaptiveTheme(sample: BackgroundSample | null, overlayOpacity: number): AdaptiveTheme {
  const hue = sample?.hue ?? 210;
  const normalizedHue = ((hue % 360) + 360) % 360;
  const accentHue = Math.round((normalizedHue + 160) % 360);
  const adjustedLuminance = sample ? sample.luminance * (1 - overlayOpacity * 0.68) : 0.18;
  const lightBackdrop = adjustedLuminance > 0.48 && overlayOpacity < 0.68;

  if (lightBackdrop) {
    return {
      accent: `hsl(${accentHue} 84% 35%)`,
      accentGlow: `hsl(${accentHue} 84% 40% / 0.22)`,
      border: 'rgb(15 23 42 / 0.2)',
      muted: 'rgb(15 23 42 / 0.78)',
      shadow: '0 1px 2px rgb(255 255 255 / 0.92), 0 0 24px rgb(255 255 255 / 0.72)',
      softShadow: '0 1px 2px rgb(255 255 255 / 0.8), 0 0 18px rgb(255 255 255 / 0.52)',
      subtle: 'rgb(15 23 42 / 0.58)',
      text: '#0f172a',
      tone: 'light',
    };
  }

  return {
    accent: `hsl(${accentHue} 90% 72%)`,
    accentGlow: `hsl(${accentHue} 90% 68% / 0.36)`,
    border: 'rgb(255 255 255 / 0.18)',
    muted: 'rgb(248 250 252 / 0.78)',
    shadow: '0 2px 16px rgb(2 6 23 / 0.66), 0 0 2px rgb(2 6 23 / 0.95)',
    softShadow: '0 2px 12px rgb(2 6 23 / 0.5)',
    subtle: 'rgb(248 250 252 / 0.54)',
    text: '#f8fafc',
    tone: 'dark',
  };
}

function applyAdaptiveTheme(theme: AdaptiveTheme) {
  const root = document.documentElement;
  root.dataset.backgroundTone = theme.tone;
  root.style.setProperty('--adaptive-text', theme.text);
  root.style.setProperty('--adaptive-text-muted', theme.muted);
  root.style.setProperty('--adaptive-text-subtle', theme.subtle);
  root.style.setProperty('--adaptive-text-shadow', theme.shadow);
  root.style.setProperty('--adaptive-text-shadow-soft', theme.softShadow);
  root.style.setProperty('--adaptive-border', theme.border);
  root.style.setProperty('--adaptive-accent', theme.accent);
  root.style.setProperty('--adaptive-accent-glow', theme.accentGlow);
}

function sampleBackgroundImage(imageUrl: string) {
  return new Promise<BackgroundSample>((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.referrerPolicy = 'no-referrer';
    image.decoding = 'async';

    image.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const size = 18;
        canvas.width = size;
        canvas.height = size;

        const context = canvas.getContext('2d', { willReadFrequently: true });
        if (!context) {
          reject(new Error('Canvas context unavailable'));
          return;
        }

        context.drawImage(image, 0, 0, size, size);
        const pixels = context.getImageData(0, 0, size, size).data;
        let red = 0;
        let green = 0;
        let blue = 0;
        let count = 0;

        for (let index = 0; index < pixels.length; index += 4) {
          const alpha = pixels[index + 3];
          if (alpha < 12) continue;
          red += pixels[index];
          green += pixels[index + 1];
          blue += pixels[index + 2];
          count += 1;
        }

        if (count === 0) {
          reject(new Error('No sampleable pixels'));
          return;
        }

        const averageRed = red / count;
        const averageGreen = green / count;
        const averageBlue = blue / count;

        resolve({
          hue: getHue(averageRed, averageGreen, averageBlue),
          luminance: getRelativeLuminance(averageRed, averageGreen, averageBlue),
        });
      } catch (error) {
        reject(error);
      }
    };

    image.onerror = () => reject(new Error('Background image failed to load'));
    image.src = imageUrl;
  });
}

export function AmbientBackground() {
  const { settings } = useSiteSettings();
  const [index, setIndex] = useState(0);
  const [apiSeed, setApiSeed] = useState(1);

  const intervalMs = Math.max(3, settings.background.intervalSeconds || 10) * 1000;
  const blurStrength = Math.min(60, Math.max(0, settings.background.blurStrength ?? 18));
  const overlayOpacity = Math.min(100, Math.max(0, settings.background.overlayOpacity ?? 72)) / 100;

  const images = useMemo(() => {
    if (settings.background.mode === 'api' && settings.background.imageApiUrl.trim()) {
      return [withCacheBust(settings.background.imageApiUrl.trim(), apiSeed)];
    }

    const presetImages = settings.background.images.map((item) => item.trim()).filter(Boolean);
    return presetImages.length > 0 ? presetImages : ['https://bu.dusays.com/2026/03/24/69c1e38b4c370.jpg'];
  }, [apiSeed, settings.background.imageApiUrl, settings.background.images, settings.background.mode]);

  const fireflies = useMemo<Firefly[]>(
    () =>
      Array.from({ length: 42 }, (_, id) => ({
        delay: `${round(seededRatio(id + 1) * -18)}s`,
        duration: `${round(12 + seededRatio(id + 7) * 18)}s`,
        id,
        left: `${round(seededRatio(id + 13) * 100)}%`,
        pulseDuration: `${4 + (id % 5)}s`,
        size: `${round(3 + seededRatio(id + 19) * 4)}px`,
        top: `${round(seededRatio(id + 23) * 100)}%`,
      })),
    [],
  );

  const visibleIndex = images.length > 0 ? index % images.length : 0;
  const currentImage = images[visibleIndex] ?? '';

  useEffect(() => {
    if (settings.background.mode === 'api') {
      const timer = window.setInterval(() => setApiSeed(Date.now()), intervalMs);
      return () => window.clearInterval(timer);
    }

    if (images.length <= 1) return undefined;
    const timer = window.setInterval(() => setIndex((current) => (current + 1) % images.length), intervalMs);
    return () => window.clearInterval(timer);
  }, [images.length, intervalMs, settings.background.mode]);

  useEffect(() => {
    let cancelled = false;
    const fallbackTheme = buildAdaptiveTheme(null, overlayOpacity);
    applyAdaptiveTheme(fallbackTheme);

    if (!currentImage) return undefined;

    sampleBackgroundImage(currentImage)
      .then((sample) => {
        if (!cancelled) {
          applyAdaptiveTheme(buildAdaptiveTheme(sample, overlayOpacity));
        }
      })
      .catch(() => {
        if (!cancelled) {
          applyAdaptiveTheme(fallbackTheme);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [currentImage, overlayOpacity]);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#101322]">
      {images.map((image, itemIndex) => (
        <div
          className="absolute inset-[-4%] bg-cover bg-center transition-opacity duration-[2000ms]"
          key={`${image}-${itemIndex}`}
          style={{
            backgroundImage: `url("${image}")`,
            filter: `blur(${blurStrength}px) saturate(1.16)`,
            opacity: itemIndex === visibleIndex ? 1 : 0,
            transform: `scale(${1 + blurStrength / 180})`,
          }}
        />
      ))}

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(99,102,241,0.22),transparent_28%),radial-gradient(circle_at_78%_38%,rgba(236,72,153,0.18),transparent_30%),linear-gradient(120deg,rgba(15,23,42,0.72),rgba(49,23,57,0.56),rgba(15,23,42,0.82))]" style={{ opacity: overlayOpacity }} />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(180deg,transparent,rgba(15,23,42,0.84))]" />

      <div className="absolute left-0 right-0 top-24 h-[32vh] overflow-hidden">
        {danmakuTexts.map((text, itemIndex) => (
          <span
            className="absolute whitespace-nowrap text-sm font-semibold tracking-wide text-white/15"
            key={text}
            style={{
              animation: `danmaku-drift ${28 + itemIndex * 3}s linear ${itemIndex * -3}s infinite`,
              top: `${12 + (itemIndex % 5) * 18}%`,
            }}
          >
            {text}
          </span>
        ))}
      </div>

      <div className="absolute inset-0 mix-blend-screen">
        {fireflies.map((fly) => (
          <span
            className="absolute rounded-full bg-emerald-100/90 shadow-[0_0_14px_4px_rgba(134,239,172,0.58)]"
            key={fly.id}
            style={{
              animation: `firefly-float ${fly.duration} ease-in-out ${fly.delay} infinite, firefly-pulse ${fly.pulseDuration} ease-in-out ${fly.delay} infinite`,
              height: fly.size,
              left: fly.left,
              top: fly.top,
              width: fly.size,
            }}
          />
        ))}
      </div>

      <div className="absolute inset-x-0 bottom-0 h-28 opacity-25 [background-image:repeating-linear-gradient(100deg,transparent_0_18px,rgba(255,255,255,0.75)_19px_20px,transparent_21px_32px)]" />
    </div>
  );
}
