'use client';

import Link from 'next/link';
import { Menu, Moon, Settings, Sun, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useSiteSettings } from '@/components/settings/SettingsProvider';

function getPreferredTheme() {
  if (typeof window === 'undefined') return false;

  const saved = window.localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return saved === 'dark' || (!saved && prefersDark);
}

export function SiteHeader() {
  const { settings } = useSiteSettings();
  const [isDark, setIsDark] = useState(false);
  const [isThemeLoaded, setIsThemeLoaded] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = useMemo(
    () => [
      { href: '/writings', label: '文章', enabled: true },
      { href: '/moments', label: '瞬间', enabled: settings.modules.moments },
      { href: '/projects', label: '项目', enabled: settings.modules.projects },
      { href: '/friends', label: '友链', enabled: settings.modules.friends },
      { href: '/music', label: '音乐', enabled: settings.modules.music },
      { href: '/about', label: '关于', enabled: true },
    ],
    [settings.modules.friends, settings.modules.moments, settings.modules.music, settings.modules.projects],
  );

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setIsDark(getPreferredTheme());
      setIsThemeLoaded(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!isThemeLoaded) return;
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark, isThemeLoaded]);

  function toggleTheme() {
    const nextDark = !isDark;
    setIsDark(nextDark);
    window.localStorage.setItem('theme', nextDark ? 'dark' : 'light');
  }

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200/70 bg-white/86 backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/82">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-6">
        <Link className="group flex min-w-0 items-center gap-3" href="/">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-zinc-950 text-white shadow-sm dark:bg-white dark:text-zinc-950">
            <span className="text-sm font-semibold">H</span>
          </div>
          <div className="min-w-0">
            <div className="truncate text-lg font-semibold tracking-normal transition group-hover:text-cyan-600 dark:group-hover:text-cyan-300">
              {settings.profile.navTitle}
            </div>
            <div className="-mt-0.5 truncate text-[10px] text-zinc-500 dark:text-zinc-400">星火数字花园</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-medium text-zinc-700 dark:text-zinc-200 lg:flex">
          {navLinks
            .filter((link) => link.enabled)
            .map((link) => (
              <Link className="transition-colors hover:text-cyan-600 dark:hover:text-cyan-300" href={link.href} key={link.href}>
                {link.label}
              </Link>
            ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            className="hidden h-9 items-center rounded-full border border-zinc-300 px-4 text-sm font-medium transition hover:border-cyan-400 hover:text-cyan-700 dark:border-white/15 dark:hover:border-cyan-300 dark:hover:text-cyan-200 sm:inline-flex"
            href={settings.profile.githubUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            GitHub
          </a>

          <Link
            aria-label="打开设置"
            className="flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-zinc-100 dark:hover:bg-white/10"
            href="/settings"
          >
            <Settings size={18} />
          </Link>

          <button
            aria-label="切换主题"
            className="flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-zinc-100 dark:hover:bg-white/10"
            onClick={toggleTheme}
            type="button"
          >
            {isThemeLoaded && isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button
            aria-label="打开菜单"
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-zinc-100 dark:hover:bg-white/10 lg:hidden"
            onClick={() => setIsMenuOpen((open) => !open)}
            type="button"
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="border-t border-zinc-200 bg-white px-5 py-4 dark:border-white/10 dark:bg-zinc-950 lg:hidden">
          <nav className="flex flex-col gap-4 text-sm font-medium">
            {navLinks
              .filter((link) => link.enabled)
              .map((link) => (
                <Link
                  className="py-1 hover:text-cyan-600 dark:hover:text-cyan-300"
                  href={link.href}
                  key={link.href}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            <Link className="py-1 hover:text-cyan-600 dark:hover:text-cyan-300" href="/settings" onClick={() => setIsMenuOpen(false)}>
              设置
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
