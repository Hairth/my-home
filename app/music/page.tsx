'use client';

import Link from 'next/link';
import { ArrowLeft, Disc3, Music2, Radio } from 'lucide-react';
import { YoutubeMusicPlayer } from '@/components/music/YoutubeMusicPlayer';

export default function MusicPage() {
  return (
    <div className="min-h-screen px-4 pb-16 pt-28 text-white sm:px-6 lg:px-10">
      <div className="mx-auto w-full max-w-6xl">
        <Link className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-white/58 transition hover:text-white" href="/">
          <ArrowLeft aria-hidden="true" size={16} />
          返回首页
        </Link>

        <div className="mb-8">
          <h1 className="text-5xl font-black tracking-normal md:text-6xl">云端乐律</h1>
          <p className="mt-3 max-w-2xl text-base font-semibold leading-8 text-white/58">在代码的缝隙中寻找灵魂的共鸣，推荐合集来自站内 YouTube Music API。</p>
        </div>

        <div className="grid gap-7 lg:grid-cols-[0.88fr_1.12fr]">
          <YoutubeMusicPlayer />

          <section className="glass-panel overflow-hidden p-0">
            <div className="flex justify-center border-b border-white/10 bg-white/6 p-5">
              <div className="inline-flex rounded-full border border-white/16 bg-slate-950/28 p-1">
                <button className="rounded-full bg-indigo-500 px-10 py-2 text-xs font-black text-white shadow-lg" type="button">
                  歌词
                </button>
                <button className="rounded-full px-10 py-2 text-xs font-black text-white/38" type="button">
                  歌单
                </button>
              </div>
            </div>
            <div className="relative min-h-[560px] overflow-hidden p-8">
              <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-slate-900/38 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-slate-900/48 to-transparent" />
              <div className="flex min-h-[500px] flex-col items-center justify-center gap-8 text-center">
                <Disc3 className="animate-spin-slow text-indigo-300/35" size={52} />
                <div className="rounded-2xl bg-white/10 px-14 py-5 text-2xl font-black text-indigo-200 shadow-inner">作词：愿每个夜晚都有回声</div>
                <p className="text-lg font-bold text-white/26">作曲：YouTube Music 推荐合集</p>
                <p className="text-lg font-bold text-white/18">编曲：此刻的背景图与光点</p>
                <p className="text-lg font-bold text-white/12">制作人：Hairth 的数字花园</p>
              </div>
            </div>
          </section>
        </div>

        <section className="glass-panel mt-7 p-7">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/24 text-indigo-100">
              <Radio size={23} />
            </div>
            <div>
              <h2 className="text-2xl font-black">音乐模块已放到主页</h2>
              <p className="mt-1 text-sm font-semibold text-white/52">这里保留完整播放页效果，主页也会同步显示音乐模块。</p>
            </div>
            <Music2 className="ml-auto hidden text-white/16 md:block" size={42} />
          </div>
        </section>
      </div>
    </div>
  );
}
