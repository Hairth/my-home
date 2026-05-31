'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSiteSettings } from '@/components/settings/SettingsProvider';
import { withCacheBust } from '@/lib/site-settings';

type RotatingHeroBackgroundProps = {
  className?: string;
  intensity?: 'light' | 'strong';
};

export function RotatingHeroBackground({ className = '', intensity = 'strong' }: RotatingHeroBackgroundProps) {
  const { settings } = useSiteSettings();
  const [index, setIndex] = useState(0);
  const [apiSeed, setApiSeed] = useState(1);

  const intervalMs = Math.max(3, settings.background.intervalSeconds || 10) * 1000;

  const images = useMemo(() => {
    if (settings.background.mode === 'api' && settings.background.imageApiUrl.trim()) {
      return [withCacheBust(settings.background.imageApiUrl.trim(), apiSeed)];
    }

    const presetImages = settings.background.images.map((item) => item.trim()).filter(Boolean);
    return presetImages.length > 0 ? presetImages : ['https://bu.dusays.com/2026/03/24/69c1e38b4c370.jpg'];
  }, [apiSeed, settings.background.imageApiUrl, settings.background.images, settings.background.mode]);

  const visibleIndex = images.length > 0 ? index % images.length : 0;

  useEffect(() => {
    if (settings.background.mode === 'api') {
      const timer = window.setInterval(() => setApiSeed(Date.now()), intervalMs);
      return () => window.clearInterval(timer);
    }

    if (images.length <= 1) return undefined;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % images.length);
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [images.length, intervalMs, settings.background.mode]);

  return (
    <div aria-hidden="true" className={`absolute inset-0 overflow-hidden ${className}`}>
      {images.map((image, itemIndex) => (
        <div
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
          key={`${image}-${itemIndex}`}
          style={{ backgroundImage: `url("${image}")`, opacity: itemIndex === visibleIndex ? 1 : 0 }}
        />
      ))}
      <div
        className={
          intensity === 'strong'
            ? 'absolute inset-0 bg-[linear-gradient(90deg,rgba(8,13,23,0.84),rgba(8,13,23,0.48),rgba(8,13,23,0.16)),linear-gradient(180deg,rgba(8,13,23,0.18),rgba(8,13,23,0.7))]'
            : 'absolute inset-0 bg-[linear-gradient(90deg,rgba(8,13,23,0.62),rgba(8,13,23,0.24)),linear-gradient(180deg,rgba(8,13,23,0.08),rgba(8,13,23,0.44))]'
        }
      />
    </div>
  );
}
