'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { RotatingHeroBackground } from '@/components/RotatingHeroBackground';
import { useSiteSettings } from '@/components/settings/SettingsProvider';

type HitokotoResponse = {
  hitokoto?: string;
  from?: string;
};

const WELCOME_SESSION_KEY = 'my-home:welcome-seen';

export function WelcomeSplash() {
  const { settings, isLoaded } = useSiteSettings();
  const [isVisible, setIsVisible] = useState(false);
  const [quote, setQuote] = useState('愿你在这里找到一束可以继续往前走的光。');

  const closeSplash = useCallback(() => {
    window.sessionStorage.setItem(WELCOME_SESSION_KEY, 'true');
    setIsVisible(false);
  }, []);

  useEffect(() => {
    if (!isLoaded || !settings.welcome.enabled) return;
    const frame = window.requestAnimationFrame(() => {
      const seen = window.sessionStorage.getItem(WELCOME_SESSION_KEY) === 'true';
      setIsVisible(!seen);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [isLoaded, settings.welcome.enabled]);

  useEffect(() => {
    if (!isVisible || !settings.welcome.quoteApiUrl.trim()) return;

    const controller = new AbortController();

    fetch(settings.welcome.quoteApiUrl, { signal: controller.signal })
      .then((response) => response.json() as Promise<HitokotoResponse>)
      .then((data) => {
        if (data.hitokoto) {
          setQuote(data.from ? `${data.hitokoto} -- ${data.from}` : data.hitokoto);
        }
      })
      .catch(() => {
        setQuote('欢迎来到这片正在生长的数字花园。');
      });

    return () => controller.abort();
  }, [isVisible, settings.welcome.quoteApiUrl]);

  useEffect(() => {
    if (!isVisible || settings.welcome.autoCloseSeconds <= 0) return;
    const timer = window.setTimeout(closeSplash, settings.welcome.autoCloseSeconds * 1000);
    return () => window.clearTimeout(timer);
  }, [closeSplash, isVisible, settings.welcome.autoCloseSeconds]);

  if (!isLoaded) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-slate-950 text-white"
          exit={{ opacity: 0, scale: 1.02, filter: 'blur(12px)' }}
          initial={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
        >
          <RotatingHeroBackground intensity="strong" />
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 mx-auto w-full max-w-4xl px-6 text-center"
            initial={{ opacity: 0, y: 18 }}
            transition={{ delay: 0.12, duration: 0.55, ease: 'easeOut' }}
          >
            <div className="mb-8 inline-flex h-14 w-14 items-center justify-center rounded-full border border-white/25 bg-white/10 backdrop-blur-md">
              <Sparkles aria-hidden="true" size={24} />
            </div>
            <h1 className="adaptive-text mx-auto max-w-3xl text-5xl font-semibold leading-none tracking-normal md:text-7xl">
              {settings.welcome.title}
            </h1>
            <p className="adaptive-muted mx-auto mt-6 max-w-2xl text-lg leading-8 md:text-xl">
              {settings.welcome.subtitle}
            </p>
            <p className="adaptive-subtle mx-auto mt-6 max-w-2xl text-sm leading-7 md:text-base">
              {quote}
            </p>
            <button
              className="mt-10 inline-flex h-12 items-center gap-3 rounded-full bg-white px-7 text-sm font-semibold text-slate-950 shadow-2xl shadow-black/20 transition hover:-translate-y-0.5 hover:bg-cyan-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
              onClick={closeSplash}
              type="button"
            >
              {settings.welcome.enterLabel}
              <ArrowRight aria-hidden="true" size={18} />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
