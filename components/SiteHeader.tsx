'use client';

import Link from 'next/link';
import { Menu, Moon, Sun, X } from 'lucide-react';
import { useEffect, useState } from 'react';

const navLinks = [
  { href: '/#writings', label: '文章' },
  { href: '/#moments', label: '瞬间' },
  { href: '/#about', label: '关于' },
  { href: '/#links', label: '链接' },
];

function getPreferredTheme() {
  if (typeof window === 'undefined') return false;

  const saved = window.localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return saved === 'dark' || (!saved && prefersDark);
}

export function SiteHeader() {
  const [isDark, setIsDark] = useState(getPreferredTheme);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  function toggleTheme() {
    const nextDark = !isDark;
    setIsDark(nextDark);
    window.localStorage.setItem('theme', nextDark ? 'dark' : 'light');
  }

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200/70 bg-white/80 backdrop-blur-xl dark:border-stone-800/70 dark:bg-[#0a0a0a]/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link className="group flex items-center gap-3" href="/">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-stone-900 to-stone-700 dark:from-white dark:to-stone-300">
            <span className="text-sm font-semibold tracking-[-1px] text-white dark:text-stone-950">H</span>
          </div>
          <div>
            <div className="text-xl font-semibold tracking-[-0.5px] transition group-hover:opacity-80">Hairth</div>
            <div className="-mt-1 text-[10px] text-stone-500 dark:text-stone-400">星火</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-9 text-sm font-medium md:flex">
          {navLinks.map((link) => (
            <Link className="transition-colors hover:text-stone-600 dark:hover:text-stone-300" href={link.href} key={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a className="hidden items-center gap-2 rounded-full border border-stone-300 px-4 py-1.5 text-sm transition hover:bg-stone-50 dark:border-stone-700 dark:hover:bg-stone-900 sm:flex" href="https://github.com/Hairth" rel="noopener noreferrer" target="_blank">
            GitHub
          </a>

          <button aria-label="切换主题" className="flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-stone-100 dark:hover:bg-stone-900" onClick={toggleTheme}>
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button aria-label="打开菜单" className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-stone-100 dark:hover:bg-stone-900 md:hidden" onClick={() => setIsMenuOpen((open) => !open)}>
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="border-t border-stone-200 bg-white px-6 py-4 dark:border-stone-800 dark:bg-[#0a0a0a] md:hidden">
          <nav className="flex flex-col gap-4 text-sm font-medium">
            {navLinks.map((link) => (
              <Link className="py-1 hover:text-stone-600 dark:hover:text-stone-300" href={link.href} key={link.href} onClick={() => setIsMenuOpen(false)}>
                {link.label}
              </Link>
            ))}
            <a className="py-1" href="https://github.com/Hairth" rel="noopener noreferrer" target="_blank">
              GitHub →
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
