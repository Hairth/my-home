'use client';

import Link from 'next/link';
import {
  BookOpen,
  Camera,
  FolderKanban,
  Mail,
  Monitor,
  Search,
  Users,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { YoutubeMusicPlayer } from '@/components/music/YoutubeMusicPlayer';
import { useSiteSettings } from '@/components/settings/SettingsProvider';
import { WeatherCard } from '@/components/weather/WeatherCard';
import { projects, writings } from '@/data/site-data';

function GlassCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <section className={`glass-panel ${className}`}>{children}</section>;
}

function Stat({ label, value, tone }: { label: string; tone: string; value: number }) {
  return (
    <div className="min-w-16 text-center">
      <div className={`text-2xl font-black ${tone}`}>{value}</div>
      <div className="adaptive-subtle mt-1 text-[10px] font-bold uppercase tracking-[0.18em]">{label}</div>
    </div>
  );
}

function FeaturePoster({
  href,
  image,
  label,
  title,
  summary,
  className = '',
}: {
  className?: string;
  href: string;
  image: string;
  label: string;
  summary: string;
  title: string;
}) {
  return (
    <Link className={`group relative overflow-hidden rounded-[24px] border border-white/16 bg-white/10 shadow-2xl shadow-slate-950/20 ${className}`} href={href}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img alt="" className="absolute inset-0 h-full w-full object-cover opacity-88 transition duration-700 group-hover:scale-105" src={image} />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.06),rgba(15,23,42,0.78))]" />
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <div className="mb-3 inline-flex rounded-full bg-indigo-500 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-white">{label}</div>
        <h3 className="text-2xl font-black text-white drop-shadow">{title}</h3>
        <p className="mt-2 line-clamp-2 text-sm font-medium leading-6 text-white/78">{summary}</p>
      </div>
    </Link>
  );
}

export default function Home() {
  const { settings } = useSiteSettings();
  const [query, setQuery] = useState('');

  const searchResults = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return [];

    return writings
      .filter((document) => `${document.title} ${document.excerpt} ${document.tags.join(' ')}`.toLowerCase().includes(normalizedQuery))
      .slice(0, 4);
  }, [query]);

  const coverImages = settings.background.images.length > 0 ? settings.background.images : ['https://bu.dusays.com/2026/03/24/69c1e38b4c370.jpg'];

  return (
    <div className="adaptive-page relative min-h-screen px-4 pb-12 pt-24 sm:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
        <div className="relative mx-auto w-full max-w-2xl">
          <Search className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-white/42" size={21} />
          <input
            className="h-16 w-full rounded-[22px] border border-white/12 bg-[#25243a]/78 pl-14 pr-5 text-sm font-semibold text-white shadow-2xl shadow-slate-950/20 outline-none backdrop-blur-2xl placeholder:text-white/38 focus:border-indigo-300/60"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜文档、项目或标签..."
            value={query}
          />
          {searchResults.length > 0 && (
            <div className="absolute left-0 right-0 top-[72px] z-20 overflow-hidden rounded-2xl border border-white/12 bg-[#1d2032]/92 p-2 shadow-2xl backdrop-blur-2xl">
              {searchResults.map((document) => (
                <Link
                  className="block rounded-xl px-4 py-3 text-sm font-semibold text-white/82 transition hover:bg-white/10"
                  href={`/documents?doc=${encodeURIComponent(document.slug)}`}
                  key={document.id}
                >
                  {document.title}
                  <span className="ml-3 text-xs text-white/42">{document.readingTime}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="grid items-stretch gap-5 lg:grid-cols-12">
          <GlassCard className="h-full lg:col-span-7">
            <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-start sm:justify-between md:p-8">
              <div className="flex min-w-0 gap-5">
                <div className="h-24 w-24 shrink-0 rounded-2xl bg-gradient-to-br from-indigo-400 to-fuchsia-500 p-1 shadow-xl shadow-indigo-950/35">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img alt={settings.profile.authorName} className="h-full w-full rounded-[14px] object-cover" src={settings.profile.avatarUrl} />
                </div>
                <div className="min-w-0">
                  <h1 className="adaptive-text truncate text-4xl font-black tracking-normal">{settings.profile.authorName}</h1>
                  <p className="adaptive-muted mt-3 max-w-lg text-sm font-semibold leading-7">{settings.profile.bio}</p>
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                <a className="icon-tile" href="https://komari.megumii.com/" rel="noopener noreferrer" target="_blank" title="Komari">
                  <Monitor size={18} />
                </a>
                <a className="icon-tile" href="https://mail.google.com/" rel="noopener noreferrer" target="_blank" title="Gmail">
                  <Mail size={18} />
                </a>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-5 border-t border-white/10 px-6 py-5 md:px-8">
              <Stat label="文档" tone="text-indigo-300" value={writings.length} />
              <div className="h-10 w-px bg-white/10" />
              <Stat label="项目" tone="text-rose-300" value={projects.length} />
              <div className="adaptive-subtle ml-auto hidden text-xs font-semibold leading-6 md:block">{settings.profile.tagline}</div>
            </div>
          </GlassCard>

          <div className="h-full lg:col-span-5">
            <YoutubeMusicPlayer compact />
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-12">
          <FeaturePoster
            className="min-h-[370px] lg:col-span-4"
            href={`/documents?doc=${encodeURIComponent(writings[0].slug)}`}
            image={coverImages[0]}
            label="Latest Insight"
            summary={writings[0].excerpt}
            title={writings[0].title}
          />

          <div className="grid gap-5 lg:col-span-8">
            <FeaturePoster
              className="min-h-[220px]"
              href="/projects"
              image={coverImages[1] ?? coverImages[0]}
              label="Projects"
              summary={projects[0].description}
              title="正在构建的工具"
            />

            <WeatherCard />
          </div>
        </div>

        <GlassCard className="grid items-center gap-5 px-6 py-5 md:grid-cols-[1fr_auto]">
          <div className="adaptive-muted flex flex-wrap items-center gap-3 text-xs font-bold">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.75)]" />
            系统已稳定运行
            <span className="rounded-lg border border-sky-400/30 bg-sky-400/10 px-3 py-1 text-sky-200">Next.js 16</span>
            <span className="rounded-lg border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-cyan-200">React 19</span>
            <span className="rounded-lg border border-teal-400/30 bg-teal-400/10 px-3 py-1 text-teal-200">Tailwind 4</span>
          </div>
          <div className="flex gap-2">
            <Link className="icon-tile" href="/documents" title="文档">
              <BookOpen size={17} />
            </Link>
            <Link className="icon-tile" href="/projects" title="项目">
              <FolderKanban size={17} />
            </Link>
            <Link className="icon-tile" href="/friends" title="网站导航">
              <Users size={17} />
            </Link>
            <Link className="icon-tile" href="/music" title="音乐">
              <Camera size={17} />
            </Link>
          </div>
        </GlassCard>

        <div className="adaptive-subtle flex justify-center text-xs font-semibold">
          工作进度同步到 Hairth/my-home
        </div>
      </div>
    </div>
  );
}
