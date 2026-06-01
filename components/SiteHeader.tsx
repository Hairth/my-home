'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Moon, Settings, Sun, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSiteSettings } from '@/components/settings/SettingsProvider';

function getPreferredTheme() {
  if (typeof window === 'undefined') return false;

  const saved = window.localStorage.getItem('theme');
  return saved ? saved === 'dark' : true;
}

export function SiteHeader() {
  const { settings } = useSiteSettings();
  const pathname = usePathname();
  const [isDark, setIsDark] = useState(false);
  const [isThemeLoaded, setIsThemeLoaded] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const lastScrollYRef = useRef(0);

  const navLinks = useMemo(
    () => [
      { href: '/documents', label: '文档', enabled: true },
      { href: '/projects', label: '项目', enabled: settings.modules.projects },
      { href: '/friends', label: '网站导航', enabled: settings.modules.friends },
      { href: '/music', label: '音乐', enabled: settings.modules.music },
      { href: '/about', label: '关于', enabled: true },
    ],
    [settings.modules.friends, settings.modules.music, settings.modules.projects],
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

  useEffect(() => {
    const headerElement = headerRef.current;
    if (!headerElement) return undefined;
    const visibleHeader = headerElement;

    function setHeaderVisible(isVisible: boolean) {
      visibleHeader.classList.toggle('pointer-events-none', !isVisible);
      visibleHeader.classList.toggle('-translate-y-full', !isVisible);
      visibleHeader.classList.toggle('opacity-0', !isVisible);
      visibleHeader.classList.toggle('translate-y-0', isVisible);
      visibleHeader.classList.toggle('opacity-100', isVisible);
    }

    function updateHeaderVisibility() {
      setHeaderVisible(window.scrollY < 80 || window.scrollY < lastScrollYRef.current);
      lastScrollYRef.current = window.scrollY;
    }

    const frame = window.requestAnimationFrame(updateHeaderVisibility);
    window.addEventListener('scroll', updateHeaderVisibility, { passive: true });
    window.addEventListener('resize', updateHeaderVisibility);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', updateHeaderVisibility);
      window.removeEventListener('resize', updateHeaderVisibility);
    };
  }, []);

  function toggleTheme() {
    const nextDark = !isDark;
    setIsDark(nextDark);
    window.localStorage.setItem('theme', nextDark ? 'dark' : 'light');
  }

  return (
    <header
      ref={headerRef}
      className="fixed inset-x-0 top-0 z-50 translate-y-0 border-b border-white/10 bg-[#15182a]/72 text-white opacity-100 shadow-[0_10px_40px_rgba(15,23,42,0.24)] backdrop-blur-2xl transition duration-300"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-6">
        <Link className="group flex min-w-0 items-center gap-3" href="/">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/12 text-white shadow-sm ring-1 ring-white/15">
            <span className="text-sm font-semibold">{settings.brand.logoText.slice(0, 2) || settings.profile.navTitle.slice(0, 1) || 'H'}</span>
          </div>
          <div className="min-w-0">
            <div className="truncate text-lg font-semibold tracking-normal transition group-hover:text-cyan-600 dark:group-hover:text-cyan-300">
              {settings.profile.navTitle}
            </div>
            <div className="-mt-0.5 truncate text-[10px] text-white/45">{settings.brand.navSubtitle}</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-semibold text-white/78 lg:flex">
          {navLinks
            .filter((link) => link.enabled)
            .map((link) => (
              <Link className={`relative transition-colors hover:text-indigo-300 ${pathname === link.href ? 'text-indigo-300' : ''}`} href={link.href} key={link.href}>
                {link.label}
                {pathname === link.href && <span className="absolute -bottom-2 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-indigo-400" />}
              </Link>
            ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            className="hidden h-9 items-center rounded-full border border-white/15 bg-white/6 px-4 text-sm font-semibold text-white/82 transition hover:border-indigo-300/60 hover:bg-white/12 sm:inline-flex"
            href={settings.profile.githubUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            GitHub
          </a>

          <Link
            aria-label="打开设置"
            className="flex h-9 w-9 items-center justify-center rounded-full text-white/82 transition hover:bg-white/10"
            href="/settings"
          >
            <Settings size={18} />
          </Link>

          <button
            aria-label="切换主题"
            className="flex h-9 w-9 items-center justify-center rounded-full text-white/82 transition hover:bg-white/10"
            onClick={toggleTheme}
            type="button"
          >
            {isThemeLoaded && isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button
            aria-label="打开菜单"
            className="flex h-9 w-9 items-center justify-center rounded-full text-white/82 hover:bg-white/10 lg:hidden"
            onClick={() => setIsMenuOpen((open) => !open)}
            type="button"
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="border-t border-white/10 bg-[#15182a]/92 px-5 py-4 backdrop-blur-2xl lg:hidden">
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
