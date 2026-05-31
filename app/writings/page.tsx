import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Clock } from 'lucide-react';
import { writings } from '@/data/site-data';

export const metadata: Metadata = {
  title: '全部文章',
};

export default function WritingsIndex() {
  return (
    <div className="mx-auto max-w-5xl px-5 py-16 sm:px-6">
      <Link className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-cyan-700 dark:hover:text-cyan-200" href="/">
        <ArrowLeft aria-hidden="true" size={16} />
        返回首页
      </Link>

      <div className="mt-8 border-b border-zinc-200 pb-10 dark:border-white/10">
        <h1 className="text-5xl font-semibold tracking-normal md:text-6xl">全部文章</h1>
        <p className="mt-4 text-lg leading-8 text-zinc-600 dark:text-zinc-300">思考、实践与记录，后续可以继续扩展成 MDX 内容库。</p>
      </div>

      <div className="mt-10 space-y-5">
        {writings.map((writing) => (
          <Link
            className="group block rounded-lg border border-zinc-200 bg-white p-6 transition hover:-translate-y-0.5 hover:border-cyan-400 dark:border-white/10 dark:bg-zinc-900 dark:hover:border-cyan-300/70"
            href={`/writings/${writing.slug}`}
            key={writing.slug}
          >
            <div className="mb-3 flex flex-wrap items-center gap-4 font-mono text-xs text-zinc-500 dark:text-zinc-400">
              <span>{writing.date}</span>
              <span className="inline-flex items-center gap-1">
                <Clock aria-hidden="true" size={14} />
                {writing.readingTime}
              </span>
            </div>
            <h2 className="text-3xl font-semibold tracking-normal underline-offset-4 group-hover:underline">{writing.title}</h2>
            <p className="mt-3 text-sm leading-7 text-zinc-600 dark:text-zinc-300">{writing.excerpt}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {writing.tags.map((tag) => (
                <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs text-cyan-700 dark:bg-cyan-300/10 dark:text-cyan-200" key={tag}>
                  {tag}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
