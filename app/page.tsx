'use client';

import { useState } from 'react';

interface Writing {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  tags: string[];
  readingTime: string;
}

interface Moment {
  id: number;
  date: string;
  content: string;
  mood?: string;
}

const sampleWritings: Writing[] = [
  {
    slug: 'hello-world',
    title: '你好，星火',
    date: '2026-05-28',
    excerpt: '从零开始构建一个属于自己的数字花园。记录思考、分享生活、构建未来。',
    tags: ['思考', '起点'],
    readingTime: '3 min',
  },
  {
    slug: 'on-building',
    title: '关于构建',
    date: '2026-05-20',
    excerpt: '我相信好的工具应该像老朋友一样，安静、可靠、值得信赖。代码亦如是。',
    tags: ['工程', '哲学'],
    readingTime: '8 min',
  },
  {
    slug: 'japan-vps-notes',
    title: '日本 VPS 网络调优笔记',
    date: '2026-05-15',
    excerpt: '从 Hysteria2 到 Clash Verge 的完整路由实践，以及如何在高延迟环境下获得稳定体验。',
    tags: ['网络', 'VPS', '实践'],
    readingTime: '12 min',
  },
];

const initialMoments: Moment[] = [
  { id: 1, date: '2026-05-30', content: '今天把个人网站的基础框架搭好了。Next.js 16 + Tailwind 4，感觉很舒服。', mood: '✨' },
  { id: 2, date: '2026-05-29', content: '研究了两个参考项目，一个是极简诗意的静态站，一个是功能丰富的 Next.js 博客系统。决定融合两者之长。', mood: '🌱' },
  { id: 3, date: '2026-05-27', content: '又一次深刻体会到：工具的边界，就是创造力的边界。', mood: '🧠' },
];

export default function Home() {
  const [writings] = useState<Writing[]>(sampleWritings);
  const [moments, setMoments] = useState<Moment[]>(initialMoments);
  const [newMoment, setNewMoment] = useState('');
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Dynamic moments: add new one (saves to localStorage for demo)
  const addMoment = () => {
    if (!newMoment.trim()) return;
    
    const moment: Moment = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      content: newMoment.trim(),
      mood: '💭',
    };
    
    const updated = [moment, ...moments];
    setMoments(updated);
    setNewMoment('');
    
    // Persist demo
    localStorage.setItem('my-home-moments', JSON.stringify(updated));
  };

  // Load persisted moments on mount (client only)
  // (simplified for initial render)

  const filteredWritings = filterTag
    ? writings.filter(w => w.tags.includes(filterTag))
    : writings;

  const displayedWritings = searchQuery
    ? filteredWritings.filter(w => 
        w.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : filteredWritings;

  const allTags = Array.from(new Set(writings.flatMap(w => w.tags)));

  return (
    <>
      {/* Hero */}
      <section className=\"relative flex min-h-[92vh] items-center justify-center overflow-hidden border-b border-stone-200 dark:border-stone-800 bg-[#fafaf9] dark:bg-[#0a0a0a]\">
        <div className=\"absolute inset-0 bg-[radial-gradient(#e5e5e5_0.8px,transparent_1px)] dark:bg-[radial-gradient(#1f2937_0.8px,transparent_1px)] [background-size:4px_4px] opacity-60\" />
        
        <div className=\"relative mx-auto max-w-4xl px-6 text-center\">
          <div className=\"inline-flex items-center gap-2 rounded-full border border-stone-200 dark:border-stone-800 px-4 py-1 text-xs font-medium tracking-[2px] text-stone-500 dark:text-stone-400 mb-8\">
            DIGITAL GARDEN · 数字花园
          </div>
          
          <h1 className=\"text-7xl md:text-8xl font-semibold tracking-[-3.5px] leading-[0.92] mb-8 text-stone-950 dark:text-white\">
            星火<br />照亮<br />自己的路。
          </h1>
          
          <p className=\"max-w-md mx-auto text-xl text-stone-600 dark:text-stone-400 mb-10\">
            Hairth 的私人数字空间。<br />
            记录思考 · 分享生活 · 构建未来。
          </p>

          <div className=\"flex flex-col sm:flex-row gap-4 justify-center\">
            <a href=\"#writings\" className=\"inline-flex h-14 items-center justify-center rounded-2xl bg-stone-950 dark:bg-white px-10 text-base font-medium text-white dark:text-stone-950 transition hover:opacity-90 active:scale-[0.985]\">
              阅读文章
            </a>
            <a href=\"#moments\" className=\"inline-flex h-14 items-center justify-center rounded-2xl border border-stone-300 dark:border-stone-700 px-10 text-base font-medium transition hover:bg-stone-50 dark:hover:bg-stone-900\">
              查看瞬间
            </a>
          </div>
        </div>

        <div className=\"absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-xs tracking-[3px] text-stone-400 dark:text-stone-500\">
          SCROLL TO EXPLORE
          <div className=\"h-px w-8 bg-current mt-1\" />
        </div>
      </section>

      {/* Writings */}
      <section id=\"writings\" className=\"mx-auto max-w-6xl px-6 py-20\">
        <div className=\"flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10\">
          <div>
            <div className=\"uppercase text-xs tracking-[3px] text-stone-500 dark:text-stone-400 mb-2\">WRITINGS</div>
            <h2 className=\"text-5xl font-semibold tracking-[-1.5px]\">文章与笔记</h2>
          </div>
          <div className=\"text-stone-600 dark:text-stone-400 max-w-md text-sm md:text-base\">
            技术实践、思考随笔与生活记录。全部内容均采用 Markdown 撰写，可随时导出。
          </div>
        </div>

        {/* Search + Filter */}
        <div className=\"flex flex-col md:flex-row gap-4 mb-8\">
          <input
            type=\"text\"
            placeholder=\"搜索文章标题或内容...\"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className=\"flex-1 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#111] px-6 py-3 text-sm focus:outline-none focus:border-stone-400 dark:focus:border-stone-600 placeholder:text-stone-400\"
          />
          <div className=\"flex flex-wrap gap-2\">
            <button
              onClick={() => setFilterTag(null)}
              className={\ounded-full px-5 py-1.5 text-sm border transition \\}
            >
              全部
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setFilterTag(tag === filterTag ? null : tag)}
                className={\ounded-full px-5 py-1.5 text-sm border transition \\}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div className=\"grid gap-6 md:grid-cols-2 lg:grid-cols-3\">
          {displayedWritings.length > 0 ? (
            displayedWritings.map((writing) => (
              <a
                key={writing.slug}
                href={\/writings/\\}
                className=\"group block rounded-3xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#111] p-7 hover:border-stone-300 dark:hover:border-stone-700 transition-all hover:-translate-y-0.5\"
              >
                <div className=\"flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 mb-4 font-mono\">
                  <span>{writing.date}</span>
                  <span>{writing.readingTime}</span>
                </div>
                <h3 className=\"text-2xl font-semibold tracking-[-0.5px] leading-tight mb-4 group-hover:underline decoration-stone-300 underline-offset-4\">
                  {writing.title}
                </h3>
                <p className=\"text-stone-600 dark:text-stone-400 line-clamp-3 mb-6 text-[15px] leading-relaxed\">
                  {writing.excerpt}
                </p>
                <div className=\"flex flex-wrap gap-2\">
                  {writing.tags.map(tag => (
                    <span key={tag} className=\"text-xs px-3 py-1 rounded-full bg-stone-100 dark:bg-stone-900 text-stone-600 dark:text-stone-400\">
                      {tag}
                    </span>
                  ))}
                </div>
              </a>
            ))
          ) : (
            <div className=\"col-span-full py-12 text-center text-stone-400\">没有匹配的文章。</div>
          )}
        </div>

        <div className=\"mt-8 text-center\">
          <a href=\"/writings\" className=\"inline-flex items-center gap-2 text-sm font-medium hover:underline\">
            浏览全部文章 → <span className=\"text-xs\">({writings.length})</span>
          </a>
        </div>
      </section>

      {/* Moments - Dynamic & Interactive */}
      <section id=\"moments\" className=\"bg-white dark:bg-[#111] border-y border-stone-200 dark:border-stone-800 py-20\">
        <div className=\"mx-auto max-w-6xl px-6\">
          <div className=\"mb-10\">
            <div className=\"uppercase text-xs tracking-[3px] text-stone-500 dark:text-stone-400 mb-2\">MOMENTS</div>
            <h2 className=\"text-5xl font-semibold tracking-[-1.5px]\">瞬间记录</h2>
            <p className=\"mt-3 max-w-md text-stone-600 dark:text-stone-400\">那些闪过的念头、心情与小发现。随时记录，随时回顾。</p>
          </div>

          {/* Add new moment - fully dynamic demo */}
          <div className=\"mb-10 rounded-3xl border border-stone-200 dark:border-stone-800 bg-[#fafaf9] dark:bg-black/40 p-6 md:p-8\">
            <div className=\"font-medium mb-3 text-sm tracking-wide text-stone-500 dark:text-stone-400\">记录此刻</div>
            <div className=\"flex gap-3\">
              <input
                value={newMoment}
                onChange={(e) => setNewMoment(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addMoment()}
                placeholder=\"今天有什么想说的……\"
                className=\"flex-1 rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-[#1a1a1a] px-6 py-4 text-[15px] focus:outline-none focus:border-stone-400 placeholder:text-stone-400\"
              />
              <button
                onClick={addMoment}
                disabled={!newMoment.trim()}
                className=\"rounded-2xl bg-stone-950 dark:bg-white px-8 font-medium text-white dark:text-stone-950 disabled:opacity-50 active:scale-[0.985] transition\"
              >
                记录
              </button>
            </div>
            <div className=\"text-[11px] text-stone-400 mt-2 pl-1\">（仅本地保存演示 · 刷新后仍可看到你添加的内容）</div>
          </div>

          <div className=\"space-y-4 max-w-3xl\">
            {moments.map((moment, index) => (
              <div 
                key={moment.id}
                className=\"group flex gap-6 rounded-3xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#111] p-7 hover:border-stone-300 dark:hover:border-stone-700 transition\"
              >
                <div className=\"shrink-0 text-3xl pt-0.5 opacity-70 group-hover:opacity-100 transition\">{moment.mood || '•'}</div>
                <div className=\"flex-1 min-w-0\">
                  <div className=\"flex items-center gap-3 text-xs text-stone-500 dark:text-stone-400 font-mono mb-2\">
                    <span>{moment.date}</span>
                    <div className=\"h-px flex-1 bg-stone-200 dark:bg-stone-800\" />
                  </div>
                  <p className=\"text-[15px] leading-relaxed text-stone-800 dark:text-stone-200 pr-4\">
                    {moment.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id=\"about\" className=\"mx-auto max-w-6xl px-6 py-20\">
        <div className=\"grid md:grid-cols-12 gap-x-8 gap-y-12 items-start\">
          <div className=\"md:col-span-5\">
            <div className=\"sticky top-20\">
              <div className=\"uppercase text-xs tracking-[3px] text-stone-500 dark:text-stone-400 mb-2\">ABOUT</div>
              <h2 className=\"text-6xl font-semibold tracking-[-2px] leading-[0.95]\">我是<br />Hairth。</h2>
            </div>
          </div>

          <div className=\"md:col-span-7 space-y-8 text-[15px] leading-relaxed text-stone-700 dark:text-stone-300 max-w-2xl\">
            <p>一名热爱创造的工程师与思考者。相信工具应该服务于人，而不是反过来。</p>
            
            <p>我在这里记录技术实践、内心独白、以及那些让我觉得值得记录的瞬间。希望这些文字能成为未来某个版本的自己的参照。</p>

            <div className=\"pt-4 grid grid-cols-2 gap-px bg-stone-200 dark:bg-stone-800 rounded-3xl overflow-hidden text-sm\">
              <div className=\"bg-white dark:bg-[#111] p-7\">
                <div className=\"font-medium mb-4 text-xs tracking-widest text-stone-500\">CURRENTLY</div>
                <div className=\"space-y-1 text-stone-800 dark:text-white\">
                  <div>构建个人数字基础设施</div>
                  <div>探索 AI + 创作工具</div>
                  <div>优化网络与自托管体验</div>
                </div>
              </div>
              <div className=\"bg-white dark:bg-[#111] p-7\">
                <div className=\"font-medium mb-4 text-xs tracking-widest text-stone-500\">FAVORITES</div>
                <div className=\"space-y-1 text-stone-800 dark:text-white\">
                  <div>极简而强大的工具</div>
                  <div>深夜的思考与代码</div>
                  <div>干净的界面与流畅交互</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Links */}
      <section id=\"links\" className=\"border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-[#111] py-16\">
        <div className=\"mx-auto max-w-6xl px-6\">
          <div className=\"uppercase text-xs tracking-[3px] text-stone-500 dark:text-stone-400 mb-6\">ELSEWHERE</div>
          
          <div className=\"grid grid-cols-1 md:grid-cols-3 gap-6 text-sm\">
            {[
              { label: 'GitHub', href: 'https://github.com/Hairth', desc: '代码与开源项目' },
              { label: 'X / Twitter', href: 'https://x.com', desc: '偶尔碎碎念' },
              { label: 'RSS 订阅', href: '/feed.xml', desc: '文章更新通知' },
            ].map((item) => (
              <a key={item.label} href={item.href} target=\"_blank\" className=\"group flex flex-col rounded-3xl border border-stone-200 dark:border-stone-800 p-8 hover:border-stone-400 dark:hover:border-stone-600 transition\">
                <div className=\"font-medium text-xl tracking-tight mb-2 group-hover:underline\">{item.label}</div>
                <div className=\"text-stone-500 dark:text-stone-400 text-sm\">{item.desc}</div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
