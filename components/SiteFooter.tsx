'use client';

import Link from 'next/link';
import { useSiteSettings } from '@/components/settings/SettingsProvider';

export function SiteFooter() {
  const { settings } = useSiteSettings();
  const copyrightText = settings.brand.footerCopyright
    .replaceAll('{year}', String(new Date().getFullYear()))
    .replaceAll('{siteTitle}', settings.profile.siteTitle)
    .replaceAll('{authorName}', settings.profile.authorName);

  return (
    <footer className="border-t border-white/10 bg-[#15182a]/70 text-white backdrop-blur-2xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-10 text-sm text-zinc-500 dark:text-zinc-400 md:flex-row md:items-center md:justify-between md:px-6">
        <div>{copyrightText}</div>
        <div className="flex flex-wrap gap-6">
          <Link className="transition hover:text-cyan-700 dark:hover:text-cyan-200" href="/documents">
            {settings.brand.footerDocumentsLabel}
          </Link>
          <a
            className="transition hover:text-cyan-700 dark:hover:text-cyan-200"
            href={settings.brand.footerSourceUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            {settings.brand.footerSourceLabel}
          </a>
          <a className="transition hover:text-cyan-700 dark:hover:text-cyan-200" href={`mailto:${settings.profile.email}`}>
            {settings.brand.footerContactLabel}
          </a>
        </div>
        <div className="text-xs">{settings.brand.footerSlogan}</div>
      </div>
    </footer>
  );
}
