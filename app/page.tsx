'use client';

import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  Calendar,
  FolderKanban,
  MessageSquarePlus,
  Music2,
  Settings2,
  Sparkles,
  Users,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { RotatingHeroBackground } from '@/components/RotatingHeroBackground';
import { useSiteSettings } from '@/components/settings/SettingsProvider';
import { friends, initialMoments, projects, tracks, writings, type Moment, type Writing } from '@/data/site-data';

const MOMENTS_STORAGE_KEY = 'my-home:moments:v1';

function WritingCard({ writing }: { writing: Writing }) {
  return (
    <Link
      className="group block rounded-lg border border-zinc-200 bg-white p-6 transition hover:-translate-y-0.5 hover:border-cyan-400 hover:shadow-xl hover:shadow-cyan-950/5 dark:border-white/10 dark:bg-zinc-900/72 dark:hover:border-cyan-300/70"
      href={`/writings/${writing.slug}`}
    >
      <div className="mb-4 flex items-center justify-between gap-4 font-mono text-xs text-zinc-500 dark:text-zinc-400">
        <span>{writing.date}</span>
        <span>{writing.readingTime}</span>
      </div>
      <h3 className="mb-3 text-2xl font-semibold leading-tight tracking-normal underline-offset-4 group-hover:underline">
        {writing.title}
      </h3>
      <p className="mb-5 line-clamp-3 text-sm leading-7 text-zinc-600 dark:text-zinc-300">{writing.excerpt}</p>
      <div className="flex flex-wrap gap-2">
        {writing.tags.map((tag) => (
          <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs text-cyan-700 dark:bg-cyan-300/10 dark:text-cyan-200" key={tag}>
            {tag}
          </span>
        ))}
      </div>
    </Link>
  );
}

function SectionHeading({ eyebrow, title, summary }: { eyebrow: string; title: string; summary: string }) {
  return (
    <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <div className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-700 dark:text-cyan-300">{eyebrow}</div>
        <h2 className="text-4xl font-semibold tracking-normal md:text-5xl">{title}</h2>
      </div>
      <p className="max-w-md text-sm leading-7 text-zinc-600 dark:text-zinc-300 md:text-base">{summary}</p>
    </div>
  );
}

function ModuleLink({
  href,
  title,
  summary,
  icon,
}: {
  href: string;
  title: string;
  summary: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      className="group flex min-h-40 flex-col justify-between rounded-lg border border-zinc-200 bg-white p-6 transition hover:-translate-y-0.5 hover:border-rose-400 hover:shadow-xl hover:shadow-rose-950/5 dark:border-white/10 dark:bg-zinc-900 dark:hover:border-rose-300/70"
      href={href}
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">
        {icon}
      </div>
      <div>
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{summary}</p>
      </div>
    </Link>
  );
}

export default function Home() {
  const { settings } = useSiteSettings();
  const [moments, setMoments] = useState<Moment[]>(initialMoments);
  const [newMoment, setNewMoment] = useState('');
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const raw = window.localStorage.getItem(MOMENTS_STORAGE_KEY);
      if (!raw) return;

      try {
        const parsed = JSON.parse(raw) as Moment[];
        if (Array.isArray(parsed)) {
          setMoments(parsed);
        }
      } catch {
        setMoments(initialMoments);
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  const tags = useMemo(() => Array.from(new Set(writings.flatMap((writing) => writing.tags))), []);

  const visibleWritings = useMemo(() => {
    return writings
      .filter((writing) => !filterTag || writing.tags.includes(filterTag))
      .filter((writing) => {
        const query = searchQuery.trim().toLowerCase();
        if (!query) return true;
        return `${writing.title} ${writing.excerpt} ${writing.tags.join(' ')}`.toLowerCase().includes(query);
      });
  }, [filterTag, searchQuery]);

  function addMoment() {
    const content = newMoment.trim();
    if (!content) return;

    const nextMoment: Moment = {
      id: Date.now(),
      date: new Date().toISOString().slice(0, 10),
      content,
      mood: '✦',
    };

    const nextMoments = [nextMoment, ...moments];
    setMoments(nextMoments);
    setNewMoment('');
    window.localStorage.setItem(MOMENTS_STORAGE_KEY, JSON.stringify(nextMoments));
  }

  return (
    <>
      <section className="relative isolate flex min-h-[calc(100vh-4rem)] items-center overflow-hidden bg-zinc-950 text-white">
        <RotatingHeroBackground />
        <div className="relative z-10 mx-auto grid w-full max-w-7xl gap-10 px-5 py-20 sm:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
          <div className="max-w-3xl">
            <div className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-cyan-100">
              <Sparkles aria-hidden="true" size={18} />
              DIGITAL GARDEN
            </div>
            <h1 className="text-5xl font-semibold leading-none tracking-normal md:text-7xl lg:text-8xl">
              {settings.profile.siteTitle}
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-white/78 md:text-xl">{settings.profile.tagline}</p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link
                className="inline-flex h-12 items-center justify-center gap-3 rounded-full bg-white px-6 text-sm font-semibold text-zinc-950 transition hover:-translate-y-0.5 hover:bg-cyan-50"
                href="/writings"
              >
                阅读文章
                <ArrowRight aria-hidden="true" size={18} />
              </Link>
              <Link
                className="inline-flex h-12 items-center justify-center gap-3 rounded-full border border-white/35 px-6 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/10"
                href="/settings"
              >
                打开设置
                <Settings2 aria-hidden="true" size={18} />
              </Link>
            </div>
          </div>

          <div className="rounded-lg border border-white/18 bg-white/12 p-6 backdrop-blur-xl">
            <div className="flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt={settings.profile.authorName}
                className="h-16 w-16 rounded-lg object-cover ring-1 ring-white/25"
                src={settings.profile.avatarUrl}
              />
              <div>
                <div className="text-2xl font-semibold">{settings.profile.authorName}</div>
                <div className="mt-1 text-sm text-white/65">{settings.profile.location}</div>
              </div>
            </div>
            <p className="mt-6 text-sm leading-7 text-white/75">{settings.profile.bio}</p>
            <div className="mt-7 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-lg bg-white/12 px-3 py-4">
                <div className="text-2xl font-semibold">{writings.length}</div>
                <div className="mt-1 text-xs text-white/60">文章</div>
              </div>
              <div className="rounded-lg bg-white/12 px-3 py-4">
                <div className="text-2xl font-semibold">{moments.length}</div>
                <div className="mt-1 text-xs text-white/60">瞬间</div>
              </div>
              <div className="rounded-lg bg-white/12 px-3 py-4">
                <div className="text-2xl font-semibold">{projects.length}</div>
                <div className="mt-1 text-xs text-white/60">项目</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {settings.modules.dashboard && (
        <section className="border-b border-zinc-200 bg-white py-12 dark:border-white/10 dark:bg-zinc-950">
          <div className="mx-auto grid max-w-7xl gap-4 px-5 sm:px-6 md:grid-cols-4">
            <ModuleLink href="/writings" icon={<BookOpen size={21} />} summary="按标签和关键词浏览写作记录。" title="文章库" />
            {settings.modules.moments && (
              <ModuleLink href="/moments" icon={<MessageSquarePlus size={21} />} summary="保存短句、状态和当天的小发现。" title="瞬间" />
            )}
            {settings.modules.projects && (
              <ModuleLink href="/projects" icon={<FolderKanban size={21} />} summary="整理正在构建的工具与实验。" title="项目" />
            )}
            {settings.modules.friends && (
              <ModuleLink href="/friends" icon={<Users size={21} />} summary="收纳参考项目与朋友链接。" title="友链" />
            )}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-6">
        <SectionHeading eyebrow="WRITINGS" summary="技术实践、生活随笔和长期思考都会沉到这里，后续可以继续接入 Markdown/MDX。" title="文章与笔记" />

        <div className="mb-8 flex flex-col gap-4 lg:flex-row">
          <input
            className="min-h-12 flex-1 rounded-lg border border-zinc-200 bg-white px-5 text-sm placeholder:text-zinc-400 focus:border-cyan-500 dark:border-white/10 dark:bg-zinc-900"
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="搜索文章标题、摘要或标签"
            type="text"
            value={searchQuery}
          />
          <div className="flex flex-wrap gap-2">
            <button
              className={`rounded-full border px-5 py-2 text-sm font-medium transition ${
                !filterTag
                  ? 'border-zinc-950 bg-zinc-950 text-white dark:border-white dark:bg-white dark:text-zinc-950'
                  : 'border-zinc-200 hover:border-cyan-400 dark:border-white/10 dark:hover:border-cyan-300'
              }`}
              onClick={() => setFilterTag(null)}
              type="button"
            >
              全部
            </button>
            {tags.map((tag) => (
              <button
                className={`rounded-full border px-5 py-2 text-sm font-medium transition ${
                  filterTag === tag
                    ? 'border-zinc-950 bg-zinc-950 text-white dark:border-white dark:bg-white dark:text-zinc-950'
                    : 'border-zinc-200 hover:border-cyan-400 dark:border-white/10 dark:hover:border-cyan-300'
                }`}
                key={tag}
                onClick={() => setFilterTag(tag === filterTag ? null : tag)}
                type="button"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {visibleWritings.map((writing) => (
            <WritingCard key={writing.slug} writing={writing} />
          ))}
        </div>
      </section>

      {settings.modules.moments && (
        <section className="border-y border-zinc-200 bg-zinc-50 py-20 dark:border-white/10 dark:bg-zinc-900/44">
          <div className="mx-auto max-w-7xl px-5 sm:px-6">
            <SectionHeading eyebrow="MOMENTS" summary="像 XinghuisamaBlogs 的动态页一样，把短想法留在本地，刷新后仍然保留。" title="瞬间记录" />

            <div className="mb-10 rounded-lg border border-zinc-200 bg-white p-5 dark:border-white/10 dark:bg-zinc-950 md:p-6">
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  className="min-h-12 flex-1 rounded-lg border border-zinc-200 bg-white px-5 text-sm placeholder:text-zinc-400 focus:border-rose-500 dark:border-white/10 dark:bg-zinc-900"
                  onChange={(event) => setNewMoment(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') addMoment();
                  }}
                  placeholder="今天有什么想说的"
                  value={newMoment}
                />
                <button
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-rose-600 px-6 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-45"
                  disabled={!newMoment.trim()}
                  onClick={addMoment}
                  type="button"
                >
                  <MessageSquarePlus aria-hidden="true" size={18} />
                  记录
                </button>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              {moments.slice(0, 6).map((moment) => (
                <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-white/10 dark:bg-zinc-950" key={moment.id}>
                  <div className="mb-4 flex items-center gap-3 text-sm text-zinc-500 dark:text-zinc-400">
                    <span className="text-xl">{moment.mood}</span>
                    <Calendar aria-hidden="true" size={16} />
                    <span>{moment.date}</span>
                  </div>
                  <p className="text-sm leading-7 text-zinc-700 dark:text-zinc-200">{moment.content}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-6">
        <SectionHeading eyebrow="BOARD" summary="主页保留常用入口，独立子页面负责更完整的筛选、查看和管理体验。" title="功能面板" />

        <div className="grid gap-5 lg:grid-cols-3">
          {settings.modules.projects && (
            <Link className="rounded-lg border border-zinc-200 bg-white p-6 transition hover:border-violet-400 dark:border-white/10 dark:bg-zinc-900" href="/projects">
              <FolderKanban aria-hidden="true" className="mb-5 text-violet-600 dark:text-violet-300" size={28} />
              <h3 className="text-2xl font-semibold">项目</h3>
              <p className="mt-3 text-sm leading-7 text-zinc-600 dark:text-zinc-300">{projects[0].description}</p>
            </Link>
          )}
          {settings.modules.friends && (
            <Link className="rounded-lg border border-zinc-200 bg-white p-6 transition hover:border-emerald-400 dark:border-white/10 dark:bg-zinc-900" href="/friends">
              <Users aria-hidden="true" className="mb-5 text-emerald-600 dark:text-emerald-300" size={28} />
              <h3 className="text-2xl font-semibold">友链</h3>
              <p className="mt-3 text-sm leading-7 text-zinc-600 dark:text-zinc-300">已收录 {friends.length} 个参考与同步位置。</p>
            </Link>
          )}
          {settings.modules.music && (
            <Link className="rounded-lg border border-zinc-200 bg-white p-6 transition hover:border-amber-400 dark:border-white/10 dark:bg-zinc-900" href="/music">
              <Music2 aria-hidden="true" className="mb-5 text-amber-600 dark:text-amber-300" size={28} />
              <h3 className="text-2xl font-semibold">音乐</h3>
              <p className="mt-3 text-sm leading-7 text-zinc-600 dark:text-zinc-300">准备了 {tracks.length} 个歌单入口，写作时可以快速切换氛围。</p>
            </Link>
          )}
        </div>
      </section>

      <section className="border-t border-zinc-200 bg-white py-16 dark:border-white/10 dark:bg-zinc-950">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-semibold tracking-normal">欢迎词和图源已经接入设置</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-600 dark:text-zinc-300">
              修改欢迎标题、图片 API、轮换间隔或模块开关后，主页和欢迎页会立即使用新的配置。
            </p>
          </div>
          <Link
            className="inline-flex h-12 items-center justify-center gap-3 rounded-full bg-zinc-950 px-6 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-cyan-700 dark:bg-white dark:text-zinc-950 dark:hover:bg-cyan-100"
            href="/settings"
          >
            <Settings2 aria-hidden="true" size={18} />
            管理设置
          </Link>
        </div>
      </section>
    </>
  );
}
