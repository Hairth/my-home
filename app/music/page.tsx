'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { YoutubeMusicPlayer } from '@/components/music/YoutubeMusicPlayer';

export default function MusicPage() {
  return (
    <div className="min-h-screen px-4 pb-16 pt-28 text-white sm:px-6 lg:px-10">
      <div className="mx-auto w-full max-w-7xl">
        <Link className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-white/58 transition hover:text-white" href="/">
          <ArrowLeft aria-hidden="true" size={16} />
          返回首页
        </Link>

        <div className="mb-8">
          <h1 className="text-5xl font-black tracking-normal md:text-6xl">云端乐律</h1>
          <p className="mt-3 max-w-2xl text-base font-semibold leading-8 text-white/58">在代码的缝隙中寻找灵魂的共鸣，推荐合集来自站内 YouTube Music API。</p>
        </div>

        <YoutubeMusicPlayer />
      </div>
    </div>
  );
}
