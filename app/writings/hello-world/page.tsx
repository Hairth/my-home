import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function HelloWorld() {
  return (
    <article className="prose mx-auto max-w-3xl px-5 py-16 dark:prose-invert sm:px-6">
      <Link className="not-prose inline-flex items-center gap-2 text-sm text-zinc-500 no-underline hover:text-cyan-700" href="/writings">
        <ArrowLeft aria-hidden="true" size={16} />
        全部文章
      </Link>
      <h1>你好，星火</h1>
      <p className="text-zinc-500">2026-05-28 · 3 min read</p>

      <p>从零开始构建一个属于自己的数字花园。</p>
      <p>这个网站会记录思考，保存生活里的小发现，也会成为长期迭代的个人工作台。</p>

      <h2>为什么要在这里记录</h2>
      <p>因为文字和代码一样，都值得被认真对待。每一次整理，都会让未来某个时刻的自己少一点混乱，多一点确定。</p>

      <p>欢迎你来。这里会继续生长。</p>
    </article>
  );
}
