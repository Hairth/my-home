import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';

export default function HelloWorld() {
  return (
    <>
      <SiteHeader />
      <article className=\"mx-auto max-w-3xl px-6 py-16 prose dark:prose-invert\">
        <a href=\"/writings\" className=\"text-sm no-underline text-stone-500 hover:text-stone-700\">← 全部文章</a>
        <h1>你好，星火</h1>
        <p className=\"text-stone-500\">2026-05-28 · 3 min read</p>
        
        <p>从零开始构建一个属于自己的数字花园。</p>
        <p>这个网站将记录我的思考、分享生活中的小发现，并作为我长期的数字家园。</p>
        
        <h2>为什么选择在这里记录</h2>
        <p>因为我相信文字和代码一样，都值得被精心对待。希望这里的每一篇文章，都能成为未来某个时刻的陪伴。</p>
        
        <p>欢迎你来。</p>
      </article>
      <SiteFooter />
    </>
  );
}