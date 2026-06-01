'use client';

import Link from 'next/link';
import { useSiteSettings } from '@/components/settings/SettingsProvider';

export function SiteFooter() {
  const { settings } = useSiteSettings();

  return (
    <footer className="border-t border-white/10 bg-[#15182a]/70 text-white backdrop-blur-2xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-10 text-sm text-zinc-500 dark:text-zinc-400 md:flex-row md:items-center md:justify-between md:px-6">
        <div>
          © {new Date().getFullYear()} {settings.profile.authorName} · 星火. 保留所有权利。
        </div>
        <div className="flex flex-wrap gap-6">
          <Link className="transition hover:text-cyan-700 dark:hover:text-cyan-200" href="/documents">
            文档
          </Link>
          <a
            className="transition hover:text-cyan-700 dark:hover:text-cyan-200"
            href="https://github.com/Hairth/my-home"
            rel="noopener noreferrer"
            target="_blank"
          >
            Source
          </a>
          <a className="transition hover:text-cyan-700 dark:hover:text-cyan-200" href={`mailto:${settings.profile.email}`}>
            联系
          </a>
        </div>
        <div className="text-xs">用心构建的数字花园</div>
      </div>
    </footer>
  );
}
