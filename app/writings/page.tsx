import type { Metadata } from 'next';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';

export const metadata: Metadata = {
  title: '全部文章',
};

export default function WritingsIndex() {
  const writings = [
    { slug: 'hello-world', title: '你好，星火', date: '2026-05-28', excerpt: '从零开始构建一个属于自己的数字花园。', tags: ['思考', '起点'] },
    { slug: 'on-building', title: '关于构建', date: '2026-05-20', excerpt: '我相信好的工具应该像老朋友一样，安静、可靠、值得信赖。', tags: ['工程', '哲学'] },
    { slug: 'japan-vps-notes', title: '日本 VPS 网络调优笔记', date: '2026-05-15', excerpt: '从 Hysteria2 到 Clash Verge 的完整路由实践。', tags: ['网络', 'VPS'] },
  ];

  return (
    <>
      <SiteHeader />
      <div className=\"mx-auto max-w-4xl px-6 py-16\">
        <a href=\"/#writings\" className=\"text-sm text-stone-500 hover:text-stone-700 dark:hover:text-stone-300\">← 返回首页</a>
        <h1 className=\"mt-6 text-6xl font-semibold tracking-[-2px]\">全部文章</h1>
        <p className=\"mt-3 text-xl text-stone-600 dark:text-stone-400\">思考、实践与记录。</p>

        <div className=\"mt-12 space-y-6\">
          {writings.map(w => (
            <a key={w.slug} href={\/writings/\\} className=\"block group rounded-3xl border border-stone-200 dark:border-stone-800 p-8 hover:border-stone-300 dark:hover:border-stone-700 bg-white dark:bg-[#111] transition\">
              <div className=\"flex justify-between text-xs font-mono text-stone-500 mb-3\">
                <span>{w.date}</span>
                <span>5 min</span>
              </div>
              <h2 className=\"text-3xl font-semibold tracking-tight group-hover:underline decoration-stone-300 underline-offset-4 mb-3\">{w.title}</h2>
              <p className=\"text-stone-600 dark:text-stone-400 text-[15px] leading-relaxed\">{w.excerpt}</p>
              <div className=\"flex gap-2 mt-5\">{w.tags.map(t => <span key={t} className=\"text-xs px-3 py-0.5 rounded-full bg-stone-100 dark:bg-stone-900 text-stone-500\">{t}</span>)}</div>
            </a>
          ))}
        </div>
      </div>
      <SiteFooter />
    </>
  );
}
