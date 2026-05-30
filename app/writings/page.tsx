import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '全部文章',
};

const writings = [
  {
    slug: 'hello-world',
    title: '你好，星火',
    date: '2026-05-28',
    excerpt: '从零开始构建一个属于自己的数字花园。',
    tags: ['思考', '起点'],
  },
  {
    slug: 'on-building',
    title: '关于构建',
    date: '2026-05-20',
    excerpt: '好的工具应该安静、可靠、值得信赖。',
    tags: ['工程', '哲学'],
  },
  {
    slug: 'japan-vps-notes',
    title: '日本 VPS 网络调优笔记',
    date: '2026-05-15',
    excerpt: '从 Hysteria2 到 Clash Verge 的完整路由实践。',
    tags: ['网络', 'VPS'],
  },
];

export default function WritingsIndex() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <Link className="text-sm text-stone-500 hover:text-stone-700 dark:hover:text-stone-300" href="/#writings">
        ← 返回首页
      </Link>
      <h1 className="mt-6 text-6xl font-semibold tracking-[-2px]">全部文章</h1>
      <p className="mt-3 text-xl text-stone-600 dark:text-stone-400">思考、实践与记录。</p>

      <div className="mt-12 space-y-6">
        {writings.map((writing) => (
          <Link className="block rounded-3xl border border-stone-200 bg-white p-8 transition hover:border-stone-300 dark:border-stone-800 dark:bg-[#111] dark:hover:border-stone-700" href={`/writings/${writing.slug}`} key={writing.slug}>
            <div className="mb-3 flex justify-between font-mono text-xs text-stone-500">
              <span>{writing.date}</span>
              <span>5 min</span>
            </div>
            <h2 className="mb-3 text-3xl font-semibold tracking-tight underline-offset-4 hover:underline">{writing.title}</h2>
            <p className="text-[15px] leading-relaxed text-stone-600 dark:text-stone-400">{writing.excerpt}</p>
            <div className="mt-5 flex gap-2">
              {writing.tags.map((tag) => (
                <span className="rounded-full bg-stone-100 px-3 py-0.5 text-xs text-stone-500 dark:bg-stone-900" key={tag}>
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
