'use client';

import { useState } from 'react';

type Writing = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  tags: string[];
  readingTime: string;
};

type Moment = {
  id: number;
  date: string;
  content: string;
  mood: string;
};

const writings: Writing[] = [
  {
    slug: 'hello-world',
    title: '你好，星火',
    date: '2026-05-28',
    excerpt: '从零开始构建一个属于自己的数字花园。记录思考、分享生活、构建未来。',
    tags: ['思考', '起点'],
    readingTime: '3 min',
  },
  {
    slug: 'on-building',
    title: '关于构建',
    date: '2026-05-20',
    excerpt: '好的工具应该安静、可靠、值得信赖。代码如此，个人网站也如此。',
    tags: ['工程', '哲学'],
    readingTime: '8 min',
  },
  {
    slug: 'japan-vps-notes',
    title: '日本 VPS 网络调优笔记',
    date: '2026-05-15',
    excerpt: '从 Hysteria2 到 Clash Verge 的完整路由实践，以及高延迟环境下的稳定体验。',
    tags: ['网络', 'VPS', '实践'],
    readingTime: '12 min',
  },
];

const initialMoments: Moment[] = [
  {
    id: 1,
    date: '2026-05-30',
    content: '今天把个人网站的基础框架搭好了。Next.js 16 + Tailwind 4，感觉很舒服。',
    mood: '✨',
  },
  {
    id: 2,
    date: '2026-05-29',
    content: '研究了两个参考项目，一个偏静态审美，一个偏动态博客系统。决定融合两者之长。',
    mood: '🌱',
  },
  {
    id: 3,
    date: '2026-05-27',
    content: '又一次深刻体会到：工具的边界，就是创造力的边界。',
    mood: '💭',
  },
];

export default function Home() {
  const [moments, setMoments] = useState<Moment[]>(initialMoments);
  const [newMoment, setNewMoment] = useState('');
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const tags = Array.from(new Set(writings.flatMap((writing) => writing.tags)));
  const visibleWritings = writings
    .filter((writing) => !filterTag || writing.tags.includes(filterTag))
    .filter((writing) => {
      const query = searchQuery.trim().toLowerCase();
      if (!query) return true;
      return `${writing.title} ${writing.excerpt} ${writing.tags.join(' ')}`.toLowerCase().includes(query);
    });

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
    window.localStorage.setItem('my-home-moments', JSON.stringify(nextMoments));
  }

  return (
    <>
      <section className="relative flex min-h-[92vh] items-center justify-center overflow-hidden border-b border-stone-200 bg-[#fafaf9] dark:border-stone-800 dark:bg-[#0a0a0a]">
        <div className="absolute inset-0 bg-[radial-gradient(#e5e5e5_0.8px,transparent_1px)] [background-size:4px_4px] opacity-60 dark:bg-[radial-gradient(#1f2937_0.8px,transparent_1px)]" />
        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-stone-200 px-4 py-1 text-xs font-medium text-stone-500 dark:border-stone-800 dark:text-stone-400">
            DIGITAL GARDEN · 数字花园
          </div>
          <h1 className="mb-8 text-7xl font-semibold leading-[0.92] tracking-[-3px] text-stone-950 dark:text-white md:text-8xl">
            星火<br />照亮<br />自己的路。
          </h1>
          <p className="mx-auto mb-10 max-w-md text-xl text-stone-600 dark:text-stone-400">
            Hairth 的私人数字空间。<br />
            记录思考 · 分享生活 · 构建未来。
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <a className="inline-flex h-14 items-center justify-center rounded-2xl bg-stone-950 px-10 text-base font-medium text-white transition hover:opacity-90 dark:bg-white dark:text-stone-950" href="#writings">
              阅读文章
            </a>
            <a className="inline-flex h-14 items-center justify-center rounded-2xl border border-stone-300 px-10 text-base font-medium transition hover:bg-stone-50 dark:border-stone-700 dark:hover:bg-stone-900" href="#moments">
              查看瞬间
            </a>
          </div>
        </div>
      </section>

      <section id="writings" className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-2 text-xs font-medium uppercase text-stone-500 dark:text-stone-400">WRITINGS</div>
            <h2 className="text-5xl font-semibold tracking-[-1.5px]">文章与笔记</h2>
          </div>
          <p className="max-w-md text-sm text-stone-600 dark:text-stone-400 md:text-base">
            技术实践、思考随笔与生活记录。全部内容都可以继续接入 Markdown/MDX。
          </p>
        </div>

        <div className="mb-8 flex flex-col gap-4 md:flex-row">
          <input
            className="flex-1 rounded-2xl border border-stone-200 bg-white px-6 py-3 text-sm placeholder:text-stone-400 focus:border-stone-400 focus:outline-none dark:border-stone-800 dark:bg-[#111]"
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="搜索文章标题或内容..."
            type="text"
            value={searchQuery}
          />
          <div className="flex flex-wrap gap-2">
            <button
              className={`rounded-full border px-5 py-1.5 text-sm transition ${!filterTag ? 'border-stone-950 bg-stone-950 text-white dark:border-white dark:bg-white dark:text-stone-950' : 'border-stone-200 hover:bg-stone-50 dark:border-stone-800 dark:hover:bg-stone-900'}`}
              onClick={() => setFilterTag(null)}
            >
              全部
            </button>
            {tags.map((tag) => (
              <button
                className={`rounded-full border px-5 py-1.5 text-sm transition ${filterTag === tag ? 'border-stone-950 bg-stone-950 text-white dark:border-white dark:bg-white dark:text-stone-950' : 'border-stone-200 hover:bg-stone-50 dark:border-stone-800 dark:hover:bg-stone-900'}`}
                key={tag}
                onClick={() => setFilterTag(tag === filterTag ? null : tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {visibleWritings.map((writing) => (
            <a className="group block rounded-3xl border border-stone-200 bg-white p-7 transition hover:-translate-y-0.5 hover:border-stone-300 dark:border-stone-800 dark:bg-[#111] dark:hover:border-stone-700" href={`/writings/${writing.slug}`} key={writing.slug}>
              <div className="mb-4 flex items-center justify-between font-mono text-xs text-stone-500 dark:text-stone-400">
                <span>{writing.date}</span>
                <span>{writing.readingTime}</span>
              </div>
              <h3 className="mb-4 text-2xl font-semibold leading-tight tracking-[-0.5px] underline-offset-4 group-hover:underline">
                {writing.title}
              </h3>
              <p className="mb-6 line-clamp-3 text-[15px] leading-relaxed text-stone-600 dark:text-stone-400">
                {writing.excerpt}
              </p>
              <div className="flex flex-wrap gap-2">
                {writing.tags.map((tag) => (
                  <span className="rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-600 dark:bg-stone-900 dark:text-stone-400" key={tag}>
                    {tag}
                  </span>
                ))}
              </div>
            </a>
          ))}
        </div>
      </section>

      <section id="moments" className="border-y border-stone-200 bg-white py-20 dark:border-stone-800 dark:bg-[#111]">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-10">
            <div className="mb-2 text-xs font-medium uppercase text-stone-500 dark:text-stone-400">MOMENTS</div>
            <h2 className="text-5xl font-semibold tracking-[-1.5px]">瞬间记录</h2>
            <p className="mt-3 max-w-md text-stone-600 dark:text-stone-400">那些闪过的念头、心情与小发现。随时记录，随时回顾。</p>
          </div>

          <div className="mb-10 rounded-3xl border border-stone-200 bg-[#fafaf9] p-6 dark:border-stone-800 dark:bg-black/40 md:p-8">
            <div className="mb-3 text-sm font-medium text-stone-500 dark:text-stone-400">记录此刻</div>
            <div className="flex gap-3">
              <input
                className="flex-1 rounded-2xl border border-stone-200 bg-white px-6 py-4 text-[15px] placeholder:text-stone-400 focus:border-stone-400 focus:outline-none dark:border-stone-700 dark:bg-[#1a1a1a]"
                onChange={(event) => setNewMoment(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') addMoment();
                }}
                placeholder="今天有什么想说的……"
                value={newMoment}
              />
              <button className="rounded-2xl bg-stone-950 px-8 font-medium text-white transition disabled:opacity-50 dark:bg-white dark:text-stone-950" disabled={!newMoment.trim()} onClick={addMoment}>
                记录
              </button>
            </div>
          </div>

          <div className="max-w-3xl space-y-4">
            {moments.map((moment) => (
              <div className="group flex gap-6 rounded-3xl border border-stone-200 bg-white p-7 transition hover:border-stone-300 dark:border-stone-800 dark:bg-[#111] dark:hover:border-stone-700" key={moment.id}>
                <div className="shrink-0 text-3xl opacity-70 transition group-hover:opacity-100">{moment.mood}</div>
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex items-center gap-3 font-mono text-xs text-stone-500 dark:text-stone-400">
                    <span>{moment.date}</span>
                    <div className="h-px flex-1 bg-stone-200 dark:bg-stone-800" />
                  </div>
                  <p className="text-[15px] leading-relaxed text-stone-800 dark:text-stone-200">{moment.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
