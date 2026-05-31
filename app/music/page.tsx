'use client';

import Link from 'next/link';
import { ArrowLeft, Music2, Play } from 'lucide-react';
import { useState } from 'react';
import { tracks } from '@/data/site-data';

export default function MusicPage() {
  const [activeId, setActiveId] = useState(tracks[0]?.id ?? '');
  const activeTrack = tracks.find((track) => track.id === activeId) ?? tracks[0];

  return (
    <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6">
      <Link className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-cyan-700 dark:hover:text-cyan-200" href="/">
        <ArrowLeft aria-hidden="true" size={16} />
        返回首页
      </Link>

      <div className="mt-8 flex flex-col gap-6 border-b border-zinc-200 pb-10 dark:border-white/10 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-5xl font-semibold tracking-normal md:text-6xl">音乐</h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-zinc-600 dark:text-zinc-300">保留 XinghuisamaBlogs 的歌单式入口，适合写作和调试时切换氛围。</p>
        </div>
        <Music2 aria-hidden="true" className="text-amber-600 dark:text-amber-300" size={42} />
      </div>

      <section className="mt-10 grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="space-y-3">
          {tracks.map((track) => (
            <button
              className={`flex w-full items-center gap-4 rounded-lg border p-5 text-left transition ${
                activeId === track.id
                  ? 'border-amber-400 bg-amber-50 dark:border-amber-300/70 dark:bg-amber-300/10'
                  : 'border-zinc-200 bg-white hover:border-amber-400 dark:border-white/10 dark:bg-zinc-900 dark:hover:border-amber-300/70'
              }`}
              key={track.id}
              onClick={() => setActiveId(track.id)}
              type="button"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-amber-500 text-white">
                <Play aria-hidden="true" size={18} />
              </div>
              <div className="min-w-0">
                <div className="truncate text-lg font-semibold">{track.title}</div>
                <div className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{track.artist}</div>
              </div>
            </button>
          ))}
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-white/10 dark:bg-zinc-900">
          <div className="mb-5">
            <div className="text-sm font-semibold text-amber-700 dark:text-amber-200">当前歌单</div>
            <h2 className="mt-2 text-3xl font-semibold">{activeTrack.title}</h2>
            <p className="mt-3 text-sm leading-7 text-zinc-600 dark:text-zinc-300">{activeTrack.note}</p>
          </div>
          <div className="overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50 dark:border-white/10 dark:bg-zinc-950">
            <iframe
              className="h-[86px] w-full"
              src={`https://music.163.com/outchain/player?type=2&id=${activeTrack.id}&auto=0&height=66`}
              title={activeTrack.title}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
