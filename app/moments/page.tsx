'use client';

import Link from 'next/link';
import { ArrowLeft, Calendar, MessageSquarePlus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { initialMoments, type Moment } from '@/data/site-data';

const MOMENTS_STORAGE_KEY = 'my-home:moments:v1';

export default function MomentsPage() {
  const [moments, setMoments] = useState<Moment[]>(initialMoments);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const raw = window.localStorage.getItem(MOMENTS_STORAGE_KEY);
      if (!raw) return;

      try {
        const parsed = JSON.parse(raw) as Moment[];
        if (Array.isArray(parsed)) setMoments(parsed);
      } catch {
        setMoments(initialMoments);
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  function persist(nextMoments: Moment[]) {
    setMoments(nextMoments);
    window.localStorage.setItem(MOMENTS_STORAGE_KEY, JSON.stringify(nextMoments));
  }

  function addMoment() {
    const content = draft.trim();
    if (!content) return;
    persist([
      {
        id: Date.now(),
        date: new Date().toISOString().slice(0, 10),
        content,
        mood: '✦',
      },
      ...moments,
    ]);
    setDraft('');
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-16 sm:px-6">
      <Link className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-cyan-700 dark:hover:text-cyan-200" href="/">
        <ArrowLeft aria-hidden="true" size={16} />
        返回首页
      </Link>

      <div className="mt-8 border-b border-zinc-200 pb-10 dark:border-white/10">
        <h1 className="text-5xl font-semibold tracking-normal md:text-6xl">瞬间</h1>
        <p className="mt-4 text-lg leading-8 text-zinc-600 dark:text-zinc-300">短想法、本地草稿和每天闪过的小发现。</p>
      </div>

      <div className="mt-10 rounded-lg border border-zinc-200 bg-white p-5 dark:border-white/10 dark:bg-zinc-900">
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            className="min-h-12 flex-1 rounded-lg border border-zinc-200 bg-white px-5 text-sm placeholder:text-zinc-400 focus:border-rose-500 dark:border-white/10 dark:bg-zinc-950"
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') addMoment();
            }}
            placeholder="记录一个瞬间"
            value={draft}
          />
          <button
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-rose-600 px-6 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-45"
            disabled={!draft.trim()}
            onClick={addMoment}
            type="button"
          >
            <MessageSquarePlus aria-hidden="true" size={18} />
            保存
          </button>
          <button
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-zinc-200 px-5 text-sm font-semibold transition hover:border-rose-400 hover:text-rose-600 dark:border-white/10 dark:hover:border-rose-300 dark:hover:text-rose-200"
            onClick={() => persist(initialMoments)}
            type="button"
          >
            <Trash2 aria-hidden="true" size={17} />
            重置
          </button>
        </div>
      </div>

      <div className="mt-8 space-y-4">
        {moments.map((moment) => (
          <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-white/10 dark:bg-zinc-900" key={moment.id}>
            <div className="mb-3 flex items-center gap-3 text-sm text-zinc-500 dark:text-zinc-400">
              <span className="text-xl">{moment.mood}</span>
              <Calendar aria-hidden="true" size={16} />
              <span>{moment.date}</span>
            </div>
            <p className="leading-8 text-zinc-700 dark:text-zinc-200">{moment.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
