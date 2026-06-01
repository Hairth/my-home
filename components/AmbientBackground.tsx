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

function seededRatio(seed: number) {
  return Math.abs(Math.sin(seed * 12.9898) * 43758.5453) % 1;
}

function round(value: number, precision = 2) {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
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

  useEffect(() => {
    if (settings.background.mode === 'api') {
      const timer = window.setInterval(() => setApiSeed(Date.now()), intervalMs);
      return () => window.clearInterval(timer);
    }

    if (images.length <= 1) return undefined;
    const timer = window.setInterval(() => setIndex((current) => (current + 1) % images.length), intervalMs);
    return () => window.clearInterval(timer);
  }, [images.length, intervalMs, settings.background.mode]);

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
