import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '关于我',
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <Link className="text-sm text-stone-500 hover:text-stone-700 dark:hover:text-stone-300" href="/#about">
        ← 返回首页
      </Link>

      <h1 className="mt-8 text-7xl font-semibold leading-none tracking-[-2px]">Hairth</h1>
      <div className="mt-2 text-2xl tracking-tight text-stone-500 dark:text-stone-400">星火 · 记录者 · 建造者</div>

      <div className="mt-12 max-w-2xl space-y-8 text-[15.5px] leading-relaxed text-stone-700 dark:text-stone-300">
        <p>欢迎来到我的数字花园。</p>
        <p>我在这里写字、做工具、思考生活。</p>
        <p>目标是构建一个长期可持续、极简优雅、真正属于自己的在线存在。</p>
      </div>

      <div className="mt-16 border-t border-stone-200 pt-10 text-xs text-stone-400 dark:border-stone-800">
        最后更新：2026-05-30
      </div>
    </div>
  );
}
