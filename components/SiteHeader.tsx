'use client';

import { useState, useEffect } from 'react';

export function SiteHeader() {
  const [isDark, setIsDark] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldDark = saved === 'dark' || (!saved && prefersDark);
    setIsDark(shouldDark);
    document.documentElement.classList.toggle('dark', shouldDark);
  }, []);

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    document.documentElement.classList.toggle('dark', newDark);
    localStorage.setItem('theme', newDark ? 'dark' : 'light');
  };

  const navLinks = [
    { href: '#writings', label: '文章' },
    { href: '#moments', label: '瞬间' },
    { href: '#about', label: '关于' },
    { href: '#links', label: '链接' },
  ];

  // Simple inline icons (no external deps needed yet)
  const MoonIcon = () => <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" strokeWidth=\"2\" strokeLinecap=\"round\" strokeLinejoin=\"round\"><path d=\"M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z\"/></svg>;
  const SunIcon = () => <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" strokeWidth=\"2\" strokeLinecap=\"round\" strokeLinejoin=\"round\"><circle cx=\"12\" cy=\"12\" r=\"4\"/><path d=\"M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41\"/></svg>;
  const MenuIcon = () => <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" strokeWidth=\"2\" strokeLinecap=\"round\" strokeLinejoin=\"round\"><line x1=\"4\" y1=\"12\" x2=\"20\" y2=\"12\"/><line x1=\"4\" y1=\"6\" x2=\"20\" y2=\"6\"/><line x1=\"4\" y1=\"18\" x2=\"20\" y2=\"18\"/></svg>;
  const CloseIcon = () => <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" strokeWidth=\"2\" strokeLinecap=\"round\" strokeLinejoin=\"round\"><line x1=\"18\" y1=\"6\" x2=\"6\" y2=\"18\"/><line x1=\"6\" y1=\"6\" x2=\"18\" y2=\"18\"/></svg>;

  return (
    <header className=\"sticky top-0 z-50 border-b border-stone-200/70 bg-white/80 backdrop-blur-xl dark:border-stone-800/70 dark:bg-[#0a0a0a]/80\">
      <div className=\"mx-auto max-w-6xl px-6 flex h-16 items-center justify-between\">
        <a href=\"#\" className=\"flex items-center gap-3 group\">
          <div className=\"h-8 w-8 rounded-full bg-gradient-to-br from-stone-900 to-stone-700 dark:from-white dark:to-stone-300 flex items-center justify-center\">
            <span className=\"text-white dark:text-stone-950 text-sm font-semibold tracking-[-1px]\">H</span>
          </div>
          <div>
            <div className=\"font-semibold text-xl tracking-[-0.5px] group-hover:opacity-80 transition\">Hairth</div>
            <div className=\"text-[10px] text-stone-500 -mt-1 dark:text-stone-400\">星火</div>
          </div>
        </a>

        <nav className=\"hidden md:flex items-center gap-9 text-sm font-medium\">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className=\"hover:text-stone-600 dark:hover:text-stone-300 transition-colors\">{link.label}</a>
          ))}
        </nav>

        <div className=\"flex items-center gap-3\">
          <a href=\"https://github.com/Hairth\" target=\"_blank\" className=\"hidden sm:flex items-center gap-2 px-4 py-1.5 text-sm rounded-full border border-stone-300 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-900 transition\">GitHub</a>

          <button onClick={toggleTheme} className=\"h-9 w-9 flex items-center justify-center rounded-full hover:bg-stone-100 dark:hover:bg-stone-900 transition\" aria-label=\"切换主题\">
            {isDark ? <SunIcon /> : <MoonIcon />}
          </button>

          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className=\"md:hidden h-9 w-9 flex items-center justify-center rounded-full hover:bg-stone-100 dark:hover:bg-stone-900\">
            {isMenuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className=\"md:hidden border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-[#0a0a0a] px-6 py-4\">
          <nav className=\"flex flex-col gap-4 text-sm font-medium\">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} onClick={() => setIsMenuOpen(false)} className=\"py-1 hover:text-stone-600 dark:hover:text-stone-300\">{link.label}</a>
            ))}
            <a href=\"https://github.com/Hairth\" target=\"_blank\" className=\"py-1\">GitHub →</a>
          </nav>
        </div>
      )}
    </header>
  );
}
